// ╭────────────────────────────────────────────
// │  ATLAS BOT · Utilidades compartidas
// ╰────────────────────────────────────────────
import { jidNormalizedUser } from '@whiskeysockets/baileys'

// Pausa la ejecución durante "ms" milisegundos.
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Devuelve solo el número/identificador de un JID.
// Ejemplo: "52123...:7@s.whatsapp.net" -> "52123..."
export const getNumber = (jid = '') =>
  jidNormalizedUser(jid).split('@')[0].split(':')[0]

// Devuelve el JID del remitente del mensaje.
// En grupos se prefiere el JID de número de teléfono (@s.whatsapp.net)
// cuando WhatsApp también envía el identificador LID.
export const getSender = (msg, isGroup) => {
  const key = msg?.key || {}
  if (!isGroup) return jidNormalizedUser(key.remoteJid || '')
  const candidates = [key.participant, key.participantAlt].filter(Boolean)
  const phoneJid = candidates.find(jid => jid.endsWith('@s.whatsapp.net'))
  return jidNormalizedUser(phoneJid || candidates[0] || key.remoteJid || '')
}

// Desenvuelve mensajes anidados (efímeros, view-once, etc.)
export const unwrapMessage = (message = {}) => {
  let content = message
  if (content?.ephemeralMessage) content = content.ephemeralMessage.message
  if (content?.viewOnceMessage) content = content.viewOnceMessage.message
  if (content?.viewOnceMessageV2) content = content.viewOnceMessageV2.message
  if (content?.documentWithCaptionMessage) content = content.documentWithCaptionMessage.message
  return content || {}
}

// Extrae el texto de un mensaje (texto plano o descripción de media).
export const getMessageText = (msg) => {
  const m = unwrapMessage(msg.message)
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    ''
  ).trim()
}

// Devuelve el contextInfo del mensaje (menciones, citas, etc.)
export const getContextInfo = (msg) => {
  const m = unwrapMessage(msg.message)
  return (
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    {}
  )
}

// JIDs mencionados en el mensaje.
export const getMentions = (msg) => getContextInfo(msg)?.mentionedJid || []

// Mensaje citado (respondido), si existe.
export const getQuoted = (msg) => {
  const ctx = getContextInfo(msg)
  if (!ctx?.quotedMessage) return null
  return {
    message: ctx.quotedMessage,
    sender: ctx.participant || '',
    id: ctx.stanzaId || ''
  }
}

// Comprueba si un número/JID pertenece al dueño del bot.
export const isOwnerNumber = (config, jid) =>
  config.ownerNumbers.includes(getNumber(jid))

// Busca a un usuario dentro de los participantes de un grupo.
// Compara por ID directo y por número (soporta IDs LID y de teléfono).
export const findParticipant = (metadata, jid) => {
  if (!metadata?.participants || !jid) return null
  const target = jidNormalizedUser(jid)
  const targetNumber = getNumber(jid)
  return metadata.participants.find(participant => {
    const ids = [participant.id, participant.phoneNumber, participant.lid]
      .filter(Boolean)
      .map(id => jidNormalizedUser(id))
    return ids.includes(target) || ids.some(id => getNumber(id) === targetNumber)
  }) || null
}

// Un participante es admin si su rol es "admin" o "superadmin".
export const isAdmin = (participant) =>
  participant?.admin === 'admin' || participant?.admin === 'superadmin'

// Formatea segundos como: "2d 5h 3m 10s"
export const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

// Formatea bytes como: "85.2 MB"
export const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

// Extrae el usuario objetivo de un comando:
// primero busca una mención; si no hay, usa el mensaje citado.
export const getTargetUser = (msg) => {
  const mentioned = getMentions(msg)
  if (mentioned.length > 0) return mentioned[0]
  const quoted = getQuoted(msg)
  if (quoted?.sender) return quoted.sender
  return null
}

// Saludo según la hora local del servidor.
export const getGreeting = (date = new Date()) => {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Convierte texto a "letras pequeñas" (small caps Unicode).
// Los caracteres sin equivalente (acentos, símbolos) se dejan igual.
const SMALL_CAPS = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', ñ: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ',
  r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
}
export const toSmallCaps = (text = '') =>
  [...String(text).toLowerCase()].map(char => SMALL_CAPS[char] || char).join('')

// fetch con timeout que devuelve JSON (usa el fetch nativo de Node 20+).
export const fetchJson = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}
