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
import { config } from '../config.js'
import { logger } from './logger.js'
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
  while (!/^\d{8,15}$/.test(number)) {
    logger.warn('Ingresa el número con código de país y sin "+". Ejemplo: 521234567890')
    number = (await ask(' » Número de WhatsApp: ')).replace(/[^0-9]/g, '')
  }
  return number
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

  const usePairing = config.connectionMethod === 'pairing' && !state.creds.registered

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
  if (usePairing) {
    const number = await resolvePairingNumber()
    await sleep(2500) // pequeña espera para que el socket esté listo
    try {
      const code = await sock.requestPairingCode(number)
      console.log('')
      logger.info(`Tu código de vinculación es: [ ${code} ]`)
      logger.info('En WhatsApp ve a: Ajustes » Dispositivos vinculados » Vincular con número de teléfono')
      console.log('')
    } catch (error) {
      logger.error(`No se pudo generar el código de vinculación: ${error.message}`)
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

  ctx.sock = sock
  return sock
}
