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
import {
  DEFAULT_PAIRING_BROWSER,
  PAIRING_REQUEST_TIMEOUT,
  describePairingFailure,
  isValidPairingCode,
  normalizePairingCode,
  requestVerifiedPairingCode
} from './pairing.js'

const {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
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

// ── « Tiempos del código de vinculación » ───
// WhatsApp mantiene viva la petición mientras la conexión siga abierta.
// Por eso el socket en modo pairing usa un qrTimeout muy largo: así el
// código NO se invalida cada dos minutos (ese era el motivo de los
// "códigos que no existen").
const PAIRING_SOCKET_TTL = 30 * 60 * 1000  // 30 minutos por conexión
const PAIRING_WAIT_MS = 25_000             // espera máxima del panel web
const PAIRING_READY_TIMEOUT = 20_000       // espera de la señal de vinculación

// Identidad del dispositivo ante WhatsApp. Las etiquetas deben ser
// canónicas: en el flujo de código WhatsApp valida la plataforma con
// más rigor que en el QR y una etiqueta rara provoca un rechazo 400
// (es decir, un código que el teléfono dice que "no existe").
const BOT_BROWSER = DEFAULT_PAIRING_BROWSER

// ── « Estado global de la conexión (para el panel web) » ──
const connectionState = {
  status: 'starting', // starting | qr | pairing | connected | reconnecting | disconnected
  method: null,       // 'qr' | 'pairing'
  qr: null,
  qrSvg: null,
  pairingCode: null,
  pairingNumber: config.pairingNumber || '',
  pairingIssuedAt: 0,
  pairingSocket: 0,
  pairingError: null,
  // Solo hay código cuando WhatsApp lo confirmó (pairingConfirmed = true).
  // pairingStage informa en qué paso va la petición:
  //   idle | waiting-signal | requesting | confirmed | failed
  pairingConfirmed: false,
  pairingStage: 'idle',
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

// Programa la reconexión (solo una a la vez: si había otra pendiente, se
// reemplaza). Evita que queden dos conexiones vivas a la vez.
const scheduleReconnect = (ctx, delay = config.reconnectDelay) => {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    startConnection(ctx).catch(error => logger.error('Error al reconectar:', error))
  }, delay)
}

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

// Normaliza un número de teléfono para el código de vinculación.
// Acepta "+598 96 719 709", "0059896719709", "598-9671-9709"...
export const normalizePairingNumber = (rawNumber) => {
  let number = String(rawNumber || '').replace(/[^0-9]/g, '')
  if (number.startsWith('00')) number = number.slice(2) // 00 = + internacional
  return number
}

// Valida el número y devuelve un mensaje claro si no sirve.
export const validatePairingNumber = (rawNumber) => {
  const number = normalizePairingNumber(rawNumber)
  if (!number) {
    return { ok: false, error: 'Escribe tu número de WhatsApp con código de país. Ejemplo: 59896719709' }
  }
  if (number.length < 8) {
    return { ok: false, error: 'El número es demasiado corto. Incluye el código de país (ej: 59896719709).' }
  }
  if (number.length > 15) {
    return { ok: false, error: 'El número es demasiado largo. Usa solo el número con código de país (máx. 15 dígitos).' }
  }
  if (number.startsWith('0')) {
    return { ok: false, error: 'El número no debe empezar con 0. Ejemplo correcto: 59896719709 (código de país + número).' }
  }
  return { ok: true, number }
}

// Formatea el código para mostrarlo en consola (``XXXX XXXX``)
const displayPairingCode = (code = '') => {
  const clean = String(code).trim().toUpperCase()
  return clean.length === 8 ? `${clean.slice(0, 4)} ${clean.slice(4)}` : clean
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
  let number = normalizePairingNumber(connectionState.pairingNumber || config.pairingNumber || '')

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
    number = normalizePairingNumber(await ask(' » Número de WhatsApp: '))
    if (number.startsWith('0')) number = number.replace(/^0+/, '')
  }
  return number
}

// Recuerda la elección del usuario entre reconexiones.
let chosenMethod = null

// ── « Código de vinculación: estado y ayudantes » ──
// Reglas reales de WhatsApp (y de Baileys):
//  1. El código se genera en el cliente y se registra en el servidor junto a
//     una clave efímera cifrada CON ese mismo código.
//  2. Solo el ÚLTIMO código pedido en la conexión actual es válido: pedir otro
//     invalida el anterior (y el usuario vería "el código no existe").
//  3. Si la conexión se cae o se reinicia, el código deja de existir.
//  4. Baileys devuelve el código en cuanto escribe la petición en el socket,
//     SIN esperar la respuesta del servidor. Si WhatsApp rechaza ese registro
//     (número inválido, socket aún sin negociar, plataforma no aceptada...) el
//     código mostrado es FALSO: el teléfono responde que no existe. Por eso la
//     petición vive en lib/pairing.js, que espera la confirmación real y, si
//     no llega, lanza un error en vez de inventar un código.
// Por eso aquí se pide UNA sola vez por conexión y número, se guarda la fecha
// de emisión y se avisa al panel cuando el código ya no sirve.
const pairing = {
  code: null,
  number: '',
  socketId: 0,
  issuedAt: 0,
  attempts: 0,
  requesting: false,
  request: null,  // promesa en curso (evita peticiones duplicadas)
  confirmed: false, // ¿WhatsApp confirmó el registro de este código?
  error: null,    // último fallo REAL al pedir el código (no simples esperas)
  errorSocket: 0  // conexión en la que ocurrió ese fallo
}

// Esperas del panel web a que aparezca el código de una conexión concreta.
const pairingWaiters = new Map() // socketId -> Set de { resolve, reject, timer }

const settleWaiters = (socketId, { code = null, error = null } = {}) => {
  const waiters = pairingWaiters.get(socketId)
  if (!waiters) return
  pairingWaiters.delete(socketId)
  for (const waiter of waiters) {
    clearTimeout(waiter.timer)
    if (error) waiter.reject(error instanceof Error ? error : new Error(String(error)))
    else waiter.resolve(code)
  }
}

const waitForPairingCode = (socketId, timeoutMs = PAIRING_WAIT_MS) =>
  new Promise((resolve, reject) => {
    // ¿Ya está listo el código de esta conexión?
    if (pairing.code && pairing.socketId === socketId) return resolve(pairing.code)

    if (!pairingWaiters.has(socketId)) pairingWaiters.set(socketId, new Set())
    const waiter = { resolve, reject, timer: null }
    waiter.timer = setTimeout(() => {
      pairingWaiters.get(socketId)?.delete(waiter)
      reject(new Error(
        'WhatsApp no devolvió el código a tiempo. Revisa tu conexión y vuelve a intentarlo.'
      ))
    }, timeoutMs)
    pairingWaiters.get(socketId).add(waiter)
  })

// Paso actual de la petición del código (lo muestra el panel web).
const setPairingStage = (stage) => {
  if (connectionState.pairingStage === stage) return
  updateState({ pairingStage: stage })
}

// Borra el código mostrado (el código dejó de ser válido).
// También borra la marca de "confirmado": sin conexión no hay código real.
const clearPairingCode = (reason = null) => {
  const teniaCodigo = Boolean(pairing.code || connectionState.pairingCode)
  pairing.code = null
  pairing.issuedAt = 0
  pairing.confirmed = false
  if (!teniaCodigo && !reason) return
  updateState({
    pairingCode: null,
    pairingConfirmed: false,
    pairingStage: 'idle',
    ...(reason ? { pairingError: reason } : {})
  })
}

// Sesión incompleta (nunca se vinculó): conviene borrarla antes de
// pedir un código nuevo, sobre todo si es de OTRO número, porque
// WhatsApp la trata como un intento anterior y el código no vale.
const clearStaleSession = (sessionPath, number) => {
  const credsFile = path.join(sessionPath, 'creds.json')
  if (!fs.existsSync(credsFile)) return false

  try {
    const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'))
    if (creds?.registered) return false

    const savedNumber = getNumber(creds?.me?.id || '')
    // "name: '~'" es el marcador que pone Baileys al pedir un código:
    // si sigue ahí, el intento anterior nunca terminó.
    const pendiente = creds?.me?.name === '~' || !creds?.me
    const otroNumero = Boolean(savedNumber && number && savedNumber !== number)

    if (pendiente || otroNumero) {
      fs.rmSync(sessionPath, { recursive: true, force: true })
      logger.info(
        otroNumero && savedNumber
          ? `Sesión incompleta de +${savedNumber} eliminada antes de generar el código de +${number}.`
          : 'Sesión incompleta eliminada para generar un código limpio.'
      )
      return true
    }
  } catch {
    // creds ilegible: mejor empezar de cero
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true })
      logger.warn('No se pudo leer la sesión anterior. Se generó una limpia.')
      return true
    } catch {}
  }
  return false
}

// Pide el código a WhatsApp UNA sola vez por conexión + número.
// Es idempotente: si el panel lo pide dos veces seguidas, recibe el MISMO
// código en lugar de renovarlo (eso invalidaba el que el usuario ya tenía).
// El código SOLO se publica cuando WhatsApp confirma el registro: si la
// petición se rechaza o no hay respuesta, se guarda el motivo y no se
// muestra nada (así nunca aparece un código que el teléfono niega).
const requestPairingCodeFor = async (sock, number, socketId) => {
  // Ya hay un código vivo y confirmado para esta misma conexión y número.
  if (pairing.code && pairing.confirmed && pairing.socketId === socketId && pairing.number === number) {
    return pairing.code
  }
  // Ya hay una petición en curso para esta conexión: se reutiliza.
  if (pairing.requesting && pairing.request && pairing.socketId === socketId) {
    return pairing.request
  }

  pairing.requesting = true
  pairing.socketId = socketId
  pairing.number = number
  pairing.confirmed = false

  const request = (async () => {
    // La conexión ya cambió (reconexión): este intento ya no sirve.
    if (socketId !== activeSocketId) {
      throw new Error('La conexión se reinició antes de generar el código. Intenta de nuevo.')
    }

    let lastError = null
    try {
      // 1) Esperar la señal de vinculación de WhatsApp (stanza pair-device).
      //    Pedir el código antes de que llegue es la causa nº 1 de códigos
      //    falsos: la petición se escribe con el cifrado sin negociar.
      setPairingStage('waiting-signal')
      await waitForSocketReady(sock, socketId)

      // 2) Registrar el código y ESPERAR la respuesta del servidor.
      setPairingStage('requesting')
      logger.info('Registrando el código de vinculación en WhatsApp...')
      const result = await requestVerifiedPairingCode(sock, number, {
        browser: BOT_BROWSER,
        timeoutMs: PAIRING_REQUEST_TIMEOUT
      })
      const code = normalizePairingCode(result?.code)

      // Controles finales: formato válido y conexión intacta.
      if (!isValidPairingCode(code)) {
        throw new Error(`WhatsApp devolvió un código inválido (${code || 'vacío'}).`)
      }
      // Una respuesta tardía de un socket cerrado jamás debe llegar al panel.
      if (socketId !== activeSocketId || closedSockets.has(socketId) ||
          connectionState.method !== 'pairing') {
        throw new Error('La conexión cambió mientras se generaba el código.')
      }

      // 3) Confirmado: recién ahora se publica en consola y en el panel.
      pairing.code = code
      pairing.confirmed = result.confirmed !== false
      pairing.issuedAt = Date.now()
      pairing.attempts = 0
      pairing.error = null
      pairing.errorSocket = 0
      updateState({
        status: 'pairing',
        method: 'pairing',
        pairingCode: code,
        pairingNumber: number,
        pairingIssuedAt: pairing.issuedAt,
        pairingSocket: socketId,
        pairingConfirmed: pairing.confirmed,
        pairingStage: 'confirmed',
        pairingError: null,
        qr: null,
        qrSvg: null,
        lastError: null
      })

      const titulo = `CÓDIGO DE VINCULACIÓN: ${displayPairingCode(code)}`
      const ancho = titulo.length + 4
      console.log('')
      console.log('  ┏' + '━'.repeat(ancho) + '┓')
      console.log(`  ┃  ${titulo}  ┃`)
      console.log('  ┗' + '━'.repeat(ancho) + '┛')
      console.log('')
      if (pairing.confirmed) {
        logger.success('WhatsApp confirmó el código: ya puedes ingresarlo en tu teléfono.')
      } else {
        logger.warn(
          'Esta versión de Baileys no dejó confirmar el código con el servidor. ' +
          'Si tu teléfono dice que no existe, pulsa "Generar otro código".'
        )
      }
      logger.info('En WhatsApp ve a: Ajustes » Dispositivos vinculados » Vincular con número de teléfono')
      logger.info(`Número destino: +${number} ・ El código también aparece en el panel web.`)
      console.log('')

      settleWaiters(socketId, { code })
      return code
    } catch (error) {
      lastError = error
    }

    pairing.attempts++
    pairing.confirmed = false
    const mensaje = describePairingFailure(lastError)
    logger.error(`No se pudo generar el código de vinculación: ${mensaje}`)
    // Se guarda el fallo REAL (con su conexión) para que el panel pueda
    // distinguirlo de "WhatsApp todavía está tardando".
    if (socketId !== activeSocketId) throw lastError
    // El aviso de "vuelve a intentarlo" solo se añade si el mensaje no lo dice ya.
    const yaLoDice = lastError?.retryable === false ||
      /int[ée]ntalo|intenta de nuevo|no se gener[óo] ning[úu]n c[óo]digo/i.test(mensaje)
    pairing.error = yaLoDice ? mensaje : `${mensaje} Puedes intentarlo de nuevo en unos segundos.`
    pairing.errorSocket = socketId
    updateState({
      pairingCode: null,
      pairingConfirmed: false,
      pairingStage: 'failed',
      pairingError: pairing.error,
      lastError: pairing.error
    })
    const finalError = new Error(pairing.error)
    settleWaiters(socketId, { error: finalError })
    throw finalError
  })().finally(() => {
    if (pairing.request === request) {
      pairing.requesting = false
      pairing.request = null
    }
  })
  pairing.request = request

  return request
}

// Espera la señal de vinculación de WhatsApp (el stanza "pair-device", que
// Baileys traduce a un evento con qr). Pedir el código antes de esa señal
// produce códigos que el teléfono dice que "no existen", así que aquí NO
// hay atajos por tiempo: o llega la señal, o se informa del fallo.
const waitForSocketReady = async (sock, socketId, timeoutMs = PAIRING_READY_TIMEOUT) => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    if (socketId !== activeSocketId || closedSockets.has(socketId)) {
      throw new Error('La conexión con WhatsApp se cerró antes de generar el código. Intenta de nuevo.')
    }
    // Primer aviso real del servidor (pair-device / conexión abierta):
    // el cifrado ya está negociado y el registro del código será válido.
    if (readySockets.has(socketId)) return
    if (!sock?.ws?.isOpen && Date.now() - start > 10_000) {
      throw new Error('No se pudo abrir la conexión con WhatsApp. Revisa el internet del servidor.')
    }
    await sleep(200)
  }

  throw new Error(
    'WhatsApp no envió la señal de vinculación a tiempo. No se generó ningún código: ' +
    'revisa la conexión del servidor e inténtalo de nuevo.'
  )
}

// Conexiones que ya recibieron el primer evento real del servidor
// (tras el QR/pair-device el cifrado ya está negociado: es el momento
// seguro para pedir el código de vinculación) y conexiones cerradas.
const readySockets = new Set()
const closedSockets = new Set()
const markSocketReady = (socketId, update = {}) => {
  const esEventoReal = Boolean(update.qr) || update.connection === 'open' || update.isNewLogin === true
  if (!esEventoReal) return
  readySockets.add(socketId)
  if (readySockets.size > 8) readySockets.delete(readySockets.values().next().value)
}

const markSocketClosed = (socketId) => {
  closedSockets.add(socketId)
  if (closedSockets.size > 8) closedSockets.delete(closedSockets.values().next().value)
}

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

// Vinculación anterior que nunca terminó: al pedir un código, Baileys marca
// la sesión con me.name = '~'. Con esa marca el siguiente arranque intenta un
// login inválido (WhatsApp responde 401) en vez de registrarse, y el código
// nuevo nunca llega. Se descarta ANTES de cargar la sesión.
const discardPendingPairingSession = (sessionPath) => {
  const credsFile = path.join(sessionPath, 'creds.json')
  if (!fs.existsSync(credsFile)) return false
  try {
    const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'))
    if (creds?.registered || creds?.me?.name !== '~') return false
    fs.rmSync(sessionPath, { recursive: true, force: true })
    logger.warn('Se descartó una vinculación anterior sin terminar: así el código nuevo se registra limpio.')
    return true
  } catch {
    return false
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
  discardPendingPairingSession(sessionPath)

  // « Sesión persistente »
  // useMultiFileAuthState guarda las credenciales en archivos,
  // así el bot no pide vincularse de nuevo tras reiniciar.
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  // Usar la versión incluida en esta instalación de Baileys. Consultar la
  // rama master en cada arranque puede devolver una versión de protocolo
  // posterior e incompatible con el cliente instalado.

  const method = await resolveConnectionMethod(ctx, state.creds.registered)
  let pairingNumber = null
  if (method === 'pairing' && !state.creds.registered) {
    pairingNumber = await resolvePairingNumber()
  }
  const usePairing = method === 'pairing' && !state.creds.registered && Boolean(pairingNumber)

  // Conexión nueva: cualquier código anterior ya no existe en WhatsApp.
  pairing.code = null
  pairing.confirmed = false
  pairing.issuedAt = 0

  updateState({
    status: state.creds.registered ? 'reconnecting' : (usePairing ? 'pairing' : 'qr'),
    method: usePairing ? 'pairing' : 'qr',
    pairingNumber: pairingNumber || connectionState.pairingNumber || '',
    pairingCode: null,
    pairingIssuedAt: 0,
    pairingConfirmed: false,
    pairingStage: usePairing ? 'waiting-signal' : 'idle',
    // Sin número todavía (cloud): el panel web lo pide y reinicia la conexión.
    pairingError: usePairing || state.creds.registered
      ? null
      : 'Escribe tu número en el panel web para recibir el código de 8 dígitos.'
  })

  const sock = makeWASocket({
    logger: baileysLogger,
    // Etiquetas canónicas: el flujo de código de vinculación las valida con
    // rigor y una etiqueta distinta provoca un rechazo (código "falso").
    browser: BOT_BROWSER,
    // Modo pairing: la conexión debe vivir mucho más que el QR para que el
    // código de 8 dígitos siga existiendo mientras el usuario lo escribe.
    // Modo QR: cada código dura 60 s (cómodo de escanear) y el socket sigue vivo.
    qrTimeout: usePairing ? PAIRING_SOCKET_TTL : 60_000,
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

  // ── « Eventos de conexión » ───────────────
  sock.ev.on('connection.update', async (update) => {
    if (socketId !== activeSocketId) return
    const { connection, lastDisconnect, qr } = update
    markSocketReady(socketId, update)

    // « Código QR en la terminal y en el panel web »
    // En modo pairing el QR se ignora por completo: ahí manda el código
    // de 8 dígitos y no queremos borrarlo de la vista del panel.
    if (qr && !usePairing) {
      updateState({
        status: 'qr',
        method: 'qr',
        qr,
        qrSvg: qrToSvg(qr),
        pairingCode: null,
        pairingIssuedAt: 0,
        pairingConfirmed: false,
        pairingStage: 'idle',
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
      pairing.code = null
      pairing.confirmed = false
      const number = getNumber(sock.user?.id || '')
      updateState({
        status: 'connected',
        qr: null,
        qrSvg: null,
        pairingCode: null,
        pairingIssuedAt: 0,
        pairingConfirmed: false,
        pairingStage: 'idle',
        pairingError: null,
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
      markSocketClosed(socketId)
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const detail = lastDisconnect?.error?.message || 'sin detalles'

      // El código de vinculación vive en la conexión: si se cierra, ese
      // código ya NO existe en WhatsApp. Se limpia para que el panel nunca
      // muestre un código muerto (ese era el bug de "código inexistente").
      clearPairingCode(
        sock.authState?.creds?.registered
          ? null // ya se vinculó: la conexión solo se reinicia (código 515)
          : 'La conexión se reinició: se generará un código nuevo.'
      )
      settleWaiters(socketId, {
        error: new Error(
          statusCode === DisconnectReason.restartRequired
            ? 'WhatsApp reinició la conexión. Vuelve a pedir el código en unos segundos.'
            : 'La conexión con WhatsApp se cerró antes de generar el código. Intenta de nuevo.'
        )
      })

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
          pairingIssuedAt: 0,
          pairingConfirmed: false,
          pairingStage: 'idle',
          pairingError: null,
          user: null,
          lastError: 'Sesión cerrada desde WhatsApp (401). Se generó una sesión limpia.'
        })

        if (!isCloudEnv()) {
          logger.warn('Vuelve a iniciar el bot para vincular una nueva sesión.')
          process.exit(1)
        }

        logger.info('Reiniciando sesión automáticamente para permitir nueva vinculación...')
        scheduleReconnect(ctx)
        return
      }

      // Cualquier otro cierre: reconexión automática.
      updateState({
        status: 'reconnecting',
        lastError: `Código ${statusCode ?? 'desconocido'}: ${detail}`
      })
      logger.warn(`Conexión cerrada [código ${statusCode ?? 'desconocido'}] » ${detail}`)
      logger.warn(`Reconectando en ${config.reconnectDelay / 1000} segundos...`)
      scheduleReconnect(ctx)
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
  // Registrar primero los eventos; solo después solicitar el código real a Baileys.
  if (usePairing) {
    requestPairingCodeFor(sock, pairingNumber, socketId).catch(() => {})
  }
  return sock
}

// ── « Acciones desde el panel web (Render) » ──

// Solicita un código de vinculación de 8 dígitos para el número indicado.
// Flujo garantizado:
//   1. Se valida el número (con código de país).
//   2. Se reinicia la conexión en modo pairing con sesión limpia.
//   3. Se pide el código UNA sola vez y se espera a que WhatsApp lo confirme.
let webPairingRequest = null
export function requestWebPairingCode(rawNumber, { force = false } = {}) {
  const check = validatePairingNumber(rawNumber)
  if (!check.ok) return Promise.reject(new Error(check.error))
  if (webPairingRequest) {
    if (!force && webPairingRequest.number === check.number) return webPairingRequest.promise
    return Promise.reject(new Error('Ya se está generando un código. Espera a que termine antes de pedir otro.'))
  }
  const promise = doRequestWebPairingCode(check.number, force)
  webPairingRequest = { number: check.number, promise }
  promise.finally(() => {
    if (webPairingRequest?.promise === promise) webPairingRequest = null
  }).catch(() => {})
  return promise
}

async function doRequestWebPairingCode(rawNumber, force) {
  const check = validatePairingNumber(rawNumber)
  if (!check.ok) throw new Error(check.error)
  const number = check.number

  if (connectionState.status === 'connected') {
    throw new Error('El bot ya está vinculado y conectado a WhatsApp.')
  }
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando. Intenta en unos segundos.')
  }

  const sessionPath = path.resolve(config.sessionName)

  // ¿El código que ya está en pantalla sigue sirviendo?
  // (Pedirlo otra vez lo invalidaría: WhatsApp solo acepta el último.)
  if (!force && pairing.code && pairing.number === number &&
      pairing.socketId === activeSocketId &&
      connectionState.pairingCode === pairing.code) {
    return {
      code: pairing.code,
      number,
      issuedAt: pairing.issuedAt || connectionState.pairingIssuedAt,
      pending: false,
      confirmed: pairing.confirmed !== false,
      message: 'Este código sigue activo: ingrésalo en WhatsApp » Dispositivos vinculados.'
    }
  }

  chosenMethod = 'pairing'
  config.pairingNumber = number
  // El próximo socket (y el auto-pedido interno) usará este número.
  connectionState.pairingNumber = number
  // Nueva petición: los fallos de intentos anteriores ya no cuentan.
  pairing.error = null
  pairing.errorSocket = 0

  // Se corta la conexión anterior: el código vive en la conexión, así que
  // pedirlo en un socket viejo (o en modo QR) es lo que producía códigos
  // que WhatsApp no reconocía.
  try { currentCtx.sock?.end?.(undefined) } catch {}
  settleWaiters(activeSocketId, {
    error: new Error('La conexión se reinició para generar un código nuevo.')
  })

  // Intento anterior sin terminar o número distinto: sesión limpia.
  clearStaleSession(sessionPath, number)

  updateState({
    status: 'pairing',
    method: 'pairing',
    pairingNumber: number,
    pairingCode: null,
    pairingIssuedAt: 0,
    pairingConfirmed: false,
    pairingStage: 'waiting-signal',
    pairingError: null,
    qr: null,
    qrSvg: null,
    lastError: null
  })

  const sock = await startConnection(currentCtx)
  const socketId = activeSocketId

  // La conexión ya tenía sesión vinculada: no hay código que pedir.
  if (sock?.authState?.creds?.registered) {
    throw new Error(
      'Esta sesión ya está vinculada a un WhatsApp. Usa "Reiniciar sesión" si quieres vincular otro número.'
    )
  }
  if (connectionState.method !== 'pairing') {
    throw new Error(
      'No se pudo iniciar el modo código de vinculación. Pulsa "Reiniciar sesión" y vuelve a intentarlo.'
    )
  }

  // startConnection ya pide el código solo; aquí esperamos ese mismo código.
  let code = await waitForPairingCode(socketId, PAIRING_WAIT_MS).catch(() => null)

  if (code && socketId === activeSocketId && !closedSockets.has(socketId)) {
    const confirmado = pairing.confirmed !== false
    return {
      code,
      number,
      issuedAt: pairing.issuedAt || connectionState.pairingIssuedAt,
      pending: false,
      confirmed: confirmado,
      message: confirmado
        ? 'Código confirmado por WhatsApp. Ingrésalo en WhatsApp » Dispositivos vinculados.'
        : 'Código generado, aunque WhatsApp no llegó a confirmarlo. Si tu teléfono dice que no existe, pulsa "Generar otro código".'
    }
  }

  // Sin código todavía: si ESTE intento falló de verdad, se informa del
  // motivo; si solo está tardando, no es un error: el panel lo mostrará
  // en cuanto WhatsApp lo confirme (sondeo cada 3 s).
  if (socketId !== activeSocketId || closedSockets.has(socketId)) {
    throw new Error('La conexión con WhatsApp se reinició. Solicita un código nuevo.')
  }
  if (pairing.error && pairing.errorSocket === socketId) {
    throw new Error(pairing.error)
  }

  return {
    code: null,
    number,
    issuedAt: 0,
    pending: true,
    confirmed: false,
    message:
      'WhatsApp todavía está confirmando el código (no se muestra ninguno hasta que lo acepte). ' +
      'Aparecerá aquí solo en unos segundos; si no llega, pulsa "Generar otro código".'
  }
}

// Reinicia la conexión en modo pairing sin cambiar de número.
export async function regeneratePairingCode() {
  const number = connectionState.pairingNumber || config.pairingNumber || ''
  if (!number) throw new Error('Primero indica tu número de WhatsApp.')
  return requestWebPairingCode(number, { force: true })
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
  clearPairingCode()
  settleWaiters(activeSocketId, { error: new Error('Se cambió al modo QR.') })
  updateState({
    status: 'qr',
    method: 'qr',
    pairingCode: null,
    pairingIssuedAt: 0,
    pairingConfirmed: false,
    pairingStage: 'idle',
    pairingError: null,
    lastError: null
  })
  try { currentCtx.sock?.end?.(undefined) } catch {}
  await startConnection(currentCtx)
}

// Borra la sesión actual y reinicia la conexión desde cero
export async function resetSession() {
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando.')
  }
  const sessionPath = path.resolve(config.sessionName)
  try { currentCtx.sock?.end?.(undefined) } catch {}
  fs.rmSync(sessionPath, { recursive: true, force: true })
  chosenMethod = 'qr'
  pairing.code = null
  pairing.confirmed = false
  pairing.issuedAt = 0
  settleWaiters(activeSocketId, { error: new Error('Sesión reiniciada.') })
  updateState({
    status: 'qr',
    method: 'qr',
    qr: null,
    qrSvg: null,
    pairingCode: null,
    pairingIssuedAt: 0,
    pairingConfirmed: false,
    pairingStage: 'idle',
    pairingError: null,
    user: null,
    lastError: null
  })
  logger.warn('Sesión reiniciada desde el panel web. Generando nuevo código QR...')
  await startConnection(currentCtx)
}

// Cierra la sesión de WhatsApp (desvincula el dispositivo) y deja el bot
// listo para vincularse de nuevo, sin reiniciar el proceso.
export async function logoutSession() {
  if (!currentCtx) {
    throw new Error('El bot aún se está inicializando.')
  }
  const sessionPath = path.resolve(config.sessionName)
  try { await currentCtx.sock?.logout?.('Cerrado desde el panel web') } catch {}
  try { currentCtx.sock?.end?.(undefined) } catch {}
  fs.rmSync(sessionPath, { recursive: true, force: true })
  chosenMethod = 'qr'
  pairing.code = null
  pairing.confirmed = false
  pairing.issuedAt = 0
  settleWaiters(activeSocketId, { error: new Error('Sesión cerrada.') })
  updateState({
    status: 'disconnected',
    method: 'qr',
    qr: null,
    qrSvg: null,
    pairingCode: null,
    pairingIssuedAt: 0,
    pairingConfirmed: false,
    pairingStage: 'idle',
    pairingError: null,
    user: null,
    lastError: 'Sesión cerrada desde el panel web.'
  })
  logger.warn('Sesión cerrada desde el panel web. Vincula el bot de nuevo cuando quieras.')
  scheduleReconnect(currentCtx)
}
