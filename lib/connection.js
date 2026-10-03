// ╭────────────────────────────────────────────
// │  ATLAS BOT · Conexión con WhatsApp
// │  - Conexión por código QR o código de vinculación
// │  - Sesión persistente (carpeta "session")
// │  - Reconexión automática ante caídas
// ╰────────────────────────────────────────────
import makeWASocket, {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
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

// Logger interno de Baileys (silenciado para no llenar la consola)
const baileysLogger = pino({ level: 'silent' })

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

// Pregunta por consola (para pedir el número en modo pairing)
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
// primero el .env; si está vacío, lo pide por consola.
const resolvePairingNumber = async () => {
  let number = config.pairingNumber

  // Sin terminal interactiva (PM2) no se puede preguntar:
  // el número debe venir en el .env.
  if (!/^\d{8,15}$/.test(number) && !process.stdin.isTTY) {
    logger.error('El modo pairing requiere PAIRING_NUMBER válido en el .env (con código de país, sin "+").')
    process.exit(1)
  }

  while (!/^\d{8,15}$/.test(number)) {
    logger.warn('Ingresa el número con código de país y sin "+". Ejemplo: 521234567890')
    number = (await ask(' » Número de WhatsApp: ')).replace(/[^0-9]/g, '')
  }
  return number
}

// Recuerda la elección del usuario entre reconexiones.
let chosenMethod = null
// El código de vinculación solo se solicita una vez por ejecución.
let pairingRequested = false

// Decide cómo se conectará el bot. Orden de prioridad:
// 1) Argumento CLI (--qr / --pairing) o CONNECTION_METHOD del .env
// 2) Si ya hay sesión guardada, no hace falta elegir
// 3) Sin terminal interactiva (PM2) -> código QR
// 4) Si nada decidió, pregunta en consola
const resolveConnectionMethod = async (ctx, registered) => {
  if (chosenMethod) return chosenMethod

  let method = ['qr', 'pairing'].includes(ctx.method) ? ctx.method : null

  if (!method && registered) method = 'qr'
  if (!method && !process.stdin.isTTY) {
    logger.warn('No hay terminal interactiva ni método definido. Se usará el código QR.')
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

export async function startConnection(ctx) {
  const sessionPath = path.resolve(config.sessionName)

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
  const usePairing = method === 'pairing' && !state.creds.registered

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
  // Se solicita una sola vez por ejecución: pedirlo en bucle
  // puede hacer que WhatsApp limite el número.
  if (usePairing && !pairingRequested) {
    pairingRequested = true
    const number = await resolvePairingNumber()
    await sleep(2500) // pequeña espera para que el socket esté listo
    try {
      const code = await sock.requestPairingCode(number)
      console.log('')
      console.log('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
      console.log(`  ┃   CÓDIGO DE VINCULACIÓN: ${code}   ┃`)
      console.log('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
      console.log('')
      logger.info('En WhatsApp ve a: Ajustes » Dispositivos vinculados » Vincular con número de teléfono')
      logger.info('Si el código expira, reinicia el bot para generar uno nuevo.')
      console.log('')
    } catch (error) {
      logger.error(`No se pudo generar el código de vinculación: ${error.message}`)
      logger.warn('Revisa el número, tu conexión a internet y vuelve a intentar reiniciando el bot.')
    }
  }

  // ── « Eventos de conexión » ───────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // « Código QR en la terminal »
    if (qr && !usePairing) {
      console.clear()
      qrcode.generate(qr, { small: true })
      logger.info('Escanea el código QR con WhatsApp:')
      logger.info('Ajustes » Dispositivos vinculados » Vincular un dispositivo')
    }

    // « Conexión establecida »
    if (connection === 'open') {
      const number = getNumber(sock.user?.id || '')
      logger.success(`${config.botName} conectado correctamente.`)
      logger.info(`Cuenta  : ${sock.user?.name || number} » +${number}`)
      logger.info(`Prefijo : [ ${[...config.prefix].join(' ')} ]`)
      logger.info('El bot está listo. Usa el comando "menu" en WhatsApp.')
    }

    // « Conexión cerrada »
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const detail = lastDisconnect?.error?.message || 'sin detalles'

      // Sesión inválida o cerrada: no tiene sentido reintentar.
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error(`La sesión fue cerrada por WhatsApp (código 401): ${detail}`)
        fs.rmSync(sessionPath, { recursive: true, force: true })
        logger.warn(`Se eliminó la carpeta "${config.sessionName}".`)
        logger.warn('Vuelve a iniciar el bot para vincular una nueva sesión.')
        process.exit(1)
      }

      // Cualquier otro cierre: reconexión automática.
      logger.warn(`Conexión cerrada [código ${statusCode ?? 'desconocido'}] » ${detail}`)
      logger.warn(`Reconectando en ${config.reconnectDelay / 1000} segundos...`)
      await sleep(config.reconnectDelay)
      startConnection(ctx).catch(error => logger.error('Error al reconectar:', error))
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
