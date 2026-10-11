// ╭────────────────────────────────────────────
// │  ATLAS BOT · Conexión con WhatsApp
// │  - Conexión por código QR o código de vinculación
// │  - Sesión persistente (carpeta "session")
// │  - Reconexión automática ante caídas
// │  - Soporte para entornos cloud sin TTY (Render)
// ╰────────────────────────────────────────────
import * as baileys from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import QRCode from 'qrcode-terminal/vendor/QRCode/index.js'
import QRErrorCorrectLevel from 'qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel.js'
import readline from 'node:readline'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config, fmt } from '../config.js'
import { logger } from './logger.js'
import { getGroupSettings } from './database.js'
import { noteJoin } from './trackers.js'
import { getNumber, sleep } from './utils.js'
import { handleMessage } from './handler.js'

const {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason
} = baileys

// makeWASocket cambia de sitio según la versión:
// 6.7 » export por defecto ・ 6.17 » export con nombre.
const makeWASocket =
  (typeof baileys.makeWASocket === 'function' && baileys.makeWASocket) ||
  (typeof baileys.default === 'function' && baileys.default) ||
  baileys.default?.default

if (typeof makeWASocket !== 'function') {
  throw new Error('Baileys incompatible: no se encontró makeWASocket. Reinstala con npm install.')
}

// Logger interno de Baileys (silenciado para no llenar la consola)
const baileysLogger = pino({ level: 'silent' })

// Detecta si corremos en Render o en un servidor sin terminal interactiva
export const isCloudEnv = () =>
  Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || !process.stdin.isTTY)

// ── « Estado global de la conexión (para el panel web) » ──
const connectionState = {
  status: 'starting', // starting | qr | pairing | connected | reconnecting | disconnected
  method: null,       // 'qr' | 'pairing'
  qr: null,
  qrSvg: null,
  pairingCode: null,
  pairingNumber: config.pairingNumber || '',
  user: null,
  lastError: null,
  updatedAt: Date.now()
}

let currentCtx = null
let reconnectTimer = null
let activeSocketId = 0

const updateState = (patch) => {
  Object.assign(connectionState, patch, { updatedAt: Date.now() })
}

export const getConnectionState = () => ({ ...connectionState })

// Genera un SVG limpio a partir del texto del QR (sin dependencias extra)
export const qrToSvg = (text) => {
  if (!text) return null
  try {
    const qr = new QRCode(-1, QRErrorCorrectLevel.L)
    qr.addData(text)
    qr.make()
    const count = qr.getModuleCount()
    const margin = 4
    const size = count + margin * 2
    let d = ''
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          d += `M${c + margin},${r + margin}h1v1h-1z`
        }
      }
    }
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" width="280" height="280">` +
      `<rect width="100%" height="100%" fill="#ffffff"/>` +
      `<path d="${d}" fill="#0a0e17"/>` +
      `</svg>`
    )
  } catch {
    return null
  }
}

// Formatea el código de vinculación como XXXX-XXXX para fácil lectura
const formatPairingCode = (code = '') => {
  const clean = String(code).trim()
  return clean.length === 8 && !clean.includes('-')
    ? `${clean.slice(0, 4)}-${clean.slice(4)}`
    : clean
}

// ── « Mini almacén de mensajes en memoria » ──
// Baileys lo usa para reintentar mensajes fallidos
// (getMessage). Sin dependencias externas.
const messageStore = new Map()
const MAX_STORED_MESSAGES = 300

const storeMessage = (msg) => {
  const id = msg?.key?.id
  if (!id) return
  messageStore.set(id, msg.message)
  if (messageStore.size > MAX_STORED_MESSAGES) {
    messageStore.delete(messageStore.keys().next().value)
  }
}

// Pregunta por consola (para pedir el número en modo pairing en terminal interactiva)
const ask = (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve =>
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  )
}

// Obtiene el número para el código de vinculación:
// primero el estado/config (.env); si está en terminal interactiva, lo pide por consola.
const resolvePairingNumber = async () => {
  let number = (connectionState.pairingNumber || config.pairingNumber || '').replace(/[^0-9]/g, '')

  // Sin terminal interactiva (Render / PM2) no se puede preguntar por stdin:
  // si no hay número válido aún, devolvemos null para que el usuario pueda
  // ingresarlo desde el panel web de Render o definir PAIRING_NUMBER en el entorno.
  if (!/^\d{8,15}$/.test(number) && isCloudEnv()) {
    logger.warn(
      'Modo pairing sin PAIRING_NUMBER válido en variables de entorno. ' +
      'Puedes ingresar tu número desde el panel web o usar el código QR.'
    )
    return null
  }

  while (!/^\d{8,15}$/.test(number)) {
    logger.warn('Ingresa el número con código de país y sin "+". Ejemplo: 521234567890')
    number = (await ask(' » Número de WhatsApp: ')).replace(/[^0-9]/g, '')
  }
  return number
}

// Recuerda la elección del usuario entre reconexiones.
let chosenMethod = null
// El código de vinculación solo se solicita una vez por socket.
let pairingRequested = false

// Decide cómo se conectará el bot. Orden de prioridad:
// 1) Elección previa (CLI, panel web o consola)
// 2) Argumento CLI (--qr / --pairing) o CONNECTION_METHOD del .env
// 3) Si PAIRING_NUMBER está definido en .env, usar pairing automáticamente
// 4) Si ya hay sesión guardada, no hace falta elegir
// 5) Sin terminal interactiva (Render / PM2) -> código QR (y panel web activo)
// 6) Si nada decidió, pregunta en consola
const resolveConnectionMethod = async (ctx, registered) => {
  if (chosenMethod) return chosenMethod

  let method = ['qr', 'pairing'].includes(ctx.method) ? ctx.method : null

  if (!method && /^\d{8,15}$/.test(config.pairingNumber)) {
    method = 'pairing'
  }
  if (!method && registered) method = 'qr'
  if (!method && isCloudEnv()) {
    logger.info('Entorno cloud/sin terminal interactiva detectado. Se iniciará con QR y panel web activo.')
    method = 'qr'
  }

  while (!method) {
    console.log('')
    logger.info('¿Cómo quieres conectar el bot?')
    console.log('    [1] Código QR')
    console.log('    [2] Código de vinculación (pairing)')
    const answer = (await ask(' » Selecciona [1 o 2]: ')).toLowerCase()
    if (answer === '1' || answer === 'qr') method = 'qr'
    else if (answer === '2' || answer === 'pairing') method = 'pairing'
    else logger.warn('Opción inválida. Escribe 1 o 2.')
  }

  chosenMethod = method
  logger.info(`Método de conexión: ${method === 'pairing' ? 'Código de vinculación' : 'Código QR'}`)
  return method
}

// Restaura creds.json desde SESSION_BASE64 o CREDS_JSON si se definió en Render
const restoreEnvSessionIfNeeded = (sessionPath) => {
  const credsFile = path.join(sessionPath, 'creds.json')
  if (fs.existsSync(credsFile)) return

  const rawJson = process.env.CREDS_JSON?.trim()
  const rawB64 = process.env.SESSION_BASE64?.trim()
  if (!rawJson && !rawB64) return

  try {
    const content = rawJson || Buffer.from(rawB64, 'base64').toString('utf-8')
    JSON.parse(content) // Verifica que sea JSON válido
    fs.mkdirSync(sessionPath, { recursive: true })
    fs.writeFileSync(credsFile, content, 'utf-8')
    logger.success('Sesión restaurada desde variable de entorno (CREDS_JSON / SESSION_BASE64).')
  } catch (error) {
    logger.warn(`No se pudo restaurar la sesión desde variables de entorno: ${error.message}`)
  }
}

export async function startConnection(ctx) {
  currentCtx = ctx
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const socketId = ++activeSocketId
  const sessionPath = path.resolve(config.sessionName)
  restoreEnvSessionIfNeeded(sessionPath)

  // « Sesión persistente »
  // useMultiFileAuthState guarda las credenciales en archivos,
  // así el bot no pide vincularse de nuevo tras reiniciar.
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  // Versión de WhatsApp Web más reciente compatible con Baileys.
  let version
  try {
    ;({ version } = await fetchLatestBaileysVersion())
  } catch {
    logger.warn('No se pudo consultar la versión de WhatsApp Web. Se usará la versión interna de Baileys.')
    version = undefined
  }

  const method = await resolveConnectionMethod(ctx, state.creds.registered)
  let pairingNumber = null
  if (method === 'pairing' && !state.creds.registered) {
    pairingNumber = await resolvePairingNumber()
  }
  const usePairing = method === 'pairing' && !state.creds.registered && Boolean(pairingNumber)

  updateState({
    status: state.creds.registered ? 'reconnecting' : (usePairing ? 'pairing' : 'qr'),
    method: usePairing ? 'pairing' : 'qr',
    pairingNumber: pairingNumber || connectionState.pairingNumber || ''
  })

  const sock = makeWASocket({
    ...(version ? { version } : {}),
    logger: baileysLogger,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      // Cachea las llaves de cifrado para reducir errores de descifrado
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger)
    },
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    getMessage: async (key) => messageStore.get(key.id)
  })

  // ── « Código de vinculación » ─────────────
  // Se solicita una sola vez por socket: pedirlo en bucle
  // puede hacer que WhatsApp limite el número.
  if (usePairing && !pairingRequested) {
    pairingRequested = true
    ;(async () => {
      await sleep(2500) // pequeña espera para que el socket esté listo
      if (socketId !== activeSocketId || sock.authState?.creds?.registered) return
      try {
        const rawCode = await sock.requestPairingCode(pairingNumber)
        const code = formatPairingCode(rawCode)
        updateState({
          status: 'pairing',
          method: 'pairing',
          pairingCode: code,
          pairingNumber,
          qr: null,
          qrSvg: null,
          lastError: null
        })
        console.log('')
        console.log('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
        console.log(`  ┃   CÓDIGO DE VINCULACIÓN: ${code}   ┃`)
        console.log('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
        console.log('')
        logger.info('En WhatsApp ve a: Ajustes » Dispositivos vinculados » Vincular con número de teléfono')
        logger.info('También puedes ver este código en el panel web de Render.')
        console.log('')
      } catch (error) {
        pairingRequested = false
        updateState({ lastError: `No se pudo generar el código: ${error.message}` })
        logger.error(`No se pudo generar el código de vinculación: ${error.message}`)
        logger.warn('Revisa el número o solicítalo de nuevo desde el panel web.')
      }
    })()
  }

  // ── « Eventos de conexión » ───────────────
  sock.ev.on('connection.update', async (update) => {
    if (socketId !== activeSocketId) return
    const { connection, lastDisconnect, qr } = update

    // « Código QR en la terminal y en el panel web »
    if (qr && !usePairing) {
      updateState({
        status: 'qr',
        method: 'qr',
        qr,
        qrSvg: qrToSvg(qr),
        pairingCode: null,
        lastError: null
      })
      if (process.stdin.isTTY && !process.env.RENDER) {
        console.clear()
      }
      qrcode.generate(qr, { small: true })
      logger.info('Escanea el código QR con WhatsApp (en esta consola o desde el panel web):')
      logger.info('Ajustes » Dispositivos vinculados » Vincular un dispositivo')
    }

    // « Conexión establecida »
    if (connection === 'open') {
      pairingRequested = false
      const number = getNumber(sock.user?.id || '')
      updateState({
        status: 'connected',
        qr: null,
        qrSvg: null,
        pairingCode: null,
        lastError: null,
        user: {
          id: sock.user?.id || '',
          name: sock.user?.name || number,
          number
        }
      })
      logger.success(`${config.botName} conectado correctamente.`)
      logger.info(`Cuenta  : ${sock.user?.name || number} » +${number}`)
      logger.info(`Prefijo : [ ${[...config.prefix].join(' ')} ]`)
      logger.info('El bot está listo. Usa el comando "menu" en WhatsApp.')
    }

    // « Conexión cerrada »
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const detail = lastDisconnect?.error?.message || 'sin detalles'
      pairingRequested = false

      // Sesión cerrada desde WhatsApp (401): limpiamos la sesión.
      // En servidor/Render NO cerramos el proceso para que el contenedor
      // siga activo y permita volver a vincular desde el panel web.
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error(`La sesión fue cerrada por WhatsApp (código 401): ${detail}`)
        fs.rmSync(sessionPath, { recursive: true, force: true })
        logger.warn(`Se eliminó la carpeta "${config.sessionName}".`)
        updateState({
          status: 'disconnected',
          qr: null,
          qrSvg: null,
          pairingCode: null,
          user: null,
          lastError: 'Sesión cerrada desde WhatsApp (401). Se generó una sesión limpia.'
        })

        if (!isCloudEnv()) {
          logger.warn('Vuelve a iniciar el bot para vincular una nueva sesión.')
          process.exit(1)
        }

        logger.info('Reiniciando sesión automáticamente para permitir nueva vinculación...')
        reconnectTimer = setTimeout(() => {
          startConnection(ctx).catch(err => logger.error('Error al reiniciar sesión:', err))
        }, config.reconnectDelay)
        return
      }

      // Cualquier otro cierre: reconexión automática.
      updateState({
        status: 'reconnecting',
        lastError: `Código ${statusCode ?? 'desconocido'}: ${detail}`
      })
      logger.warn(`Conexión cerrada [código ${statusCode ?? 'desconocido'}] » ${detail}`)
      logger.warn(`Reconectando en ${config.reconnectDelay / 1000} segundos...`)
      reconnectTimer = setTimeout(() => {
        startConnection(ctx).catch(error => logger.error('Error al reconectar:', error))
      }, config.reconnectDelay)
    }
  })

  // « Guardar credenciales cada vez que cambien »
  sock.ev.on('creds.update', saveCreds)

  // ── « Mensajes entrantes » ────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      storeMessage(msg)
      try {
        await handleMessage(sock, msg, ctx)
      } catch (error) {
        logger.error('Error procesando un mensaje:', error)
      }
    }
  })

  // ── « Bienvenida y despedida » ────────────
  // Configurable por grupo con: !bienvenida on/off,
  // textos personalizables con !setwelcome y !setbye.
  sock.ev.on('group-participants.update', async (event) => {
    try {
      const { id, participants, action } = event
      if (action !== 'add' && action !== 'remove') return

      const settings = getGroupSettings(id)

      for (const participant of participants) {
        noteJoin(id, participant)

        // Vetados que intentan volver: fuera otra vez (si bienvenida/antibot no aplica)
        if (action === 'add' && settings?.banned?.includes(getNumber(participant))) {
          try {
            await sock.groupParticipantsUpdate(id, [participant], 'remove')
            await sock.sendMessage(id, {
              text: `> @${getNumber(participant)} está vetado de este grupo.`,
              mentions: [participant]
            })
          } catch {}
          continue
        }

        if (!settings?.welcome) continue

        // Texto del mensaje (personalizado o por defecto)
        const plantilla = action === 'add'
          ? (settings.customWelcome || config.messages.welcome)
          : (settings.customBye || config.messages.bye)
        if (!plantilla) continue

        await sock.sendMessage(id, {
          text: fmt(plantilla, { user: `@${getNumber(participant)}` }),
          mentions: [participant]
        })
      }
    } catch (error) {
      logger.warn(`Bienvenida: no se pudo enviar (${error.message})`)
    }
  })

  ctx.sock = sock
  return sock
}

// ── « Acciones desde el panel web (Render) » ──

// Solicita un código de vinculación de 8 dígitos para el número indicado
export async function requestWebPairingCode(rawNumber) {
  const number = String(rawNumber || '').replace(/[^0-9]/g, '')
  if (!/^\d{8,15}$/.test(number)) {
    throw new Error('Ingresa un número válido con código de país (8 a 15 dígitos, sin "+"). Ejemplo: 59896719709')
  }
  if (connectionState.status === 'connected') {
    throw new Error('El bot ya está vinculado y conectado a WhatsApp.')
  }
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando. Intenta en unos segundos.')
  }

  chosenMethod = 'pairing'
  config.pairingNumber = number
  pairingRequested = true
  updateState({
    status: 'pairing',
    method: 'pairing',
    pairingNumber: number,
    pairingCode: null,
    qr: null,
    qrSvg: null,
    lastError: null
  })

  // Si ya hay un socket activo sin registrar, intentamos pedirle el código directamente;
  // si falla, reiniciamos la conexión en modo pairing.
  const tryRequest = async (sock) => {
    const rawCode = await sock.requestPairingCode(number)
    const code = formatPairingCode(rawCode)
    updateState({
      status: 'pairing',
      method: 'pairing',
      pairingCode: code,
      pairingNumber: number,
      qr: null,
      qrSvg: null,
      lastError: null
    })
    logger.info(`Código de vinculación generado para +${number}: ${code}`)
    return code
  }

  try {
    if (currentCtx.sock && !currentCtx.sock.authState?.creds?.registered) {
      return await tryRequest(currentCtx.sock)
    }
  } catch {
    // Si el socket actual no aceptó la petición, reconectamos limpio abajo
  }

  try { currentCtx.sock?.end?.() } catch {}
  pairingRequested = true
  const sock = await startConnection(currentCtx)
  await sleep(2500)
  try {
    return await tryRequest(sock)
  } catch (error) {
    pairingRequested = false
    updateState({ lastError: error.message })
    throw new Error(`No se pudo generar el código de vinculación: ${error.message}`)
  }
}

// Cambia al modo código QR y genera uno nuevo
export async function switchToQrMode() {
  if (connectionState.status === 'connected') {
    throw new Error('El bot ya está conectado.')
  }
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando.')
  }
  chosenMethod = 'qr'
  pairingRequested = false
  updateState({
    status: 'qr',
    method: 'qr',
    pairingCode: null,
    lastError: null
  })
  try { currentCtx.sock?.end?.() } catch {}
  await startConnection(currentCtx)
}

// Borra la sesión actual y reinicia la conexión desde cero
export async function resetSession() {
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando.')
  }
  const sessionPath = path.resolve(config.sessionName)
  try { currentCtx.sock?.end?.() } catch {}
  fs.rmSync(sessionPath, { recursive: true, force: true })
  chosenMethod = 'qr'
  pairingRequested = false
  updateState({
    status: 'qr',
    method: 'qr',
    qr: null,
    qrSvg: null,
    pairingCode: null,
    user: null,
    lastError: null
  })
  logger.warn('Sesión reiniciada desde el panel web. Generando nuevo código QR...')
  await startConnection(currentCtx)
}
