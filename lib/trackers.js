// ╭────────────────────────────────────────────
// │  ATLAS BOT · Trackers en memoria
// │  Para antispam, antiflood y antibot. No se
// │  guardan en disco: se reinician con el bot.
// ╰────────────────────────────────────────────

// Mensajes recientes por chat+usuario: [{ ts, text }]
const recentMessages = new Map() // "chat|user" -> array
const joins = new Map()          // "chat|user" -> timestamp de ingreso

const SPAM_WINDOW = 10 * 1000    // 10 segundos
const CLEANUP_EVERY = 60 * 1000  // limpieza cada minuto

const KEY = (chatId, user) => `${chatId}|${user}`

// Anota que "user" envió un mensaje con "text" en "chatId".
export const trackMessage = (chatId, user, text) => {
  const key = KEY(chatId, user)
  const list = recentMessages.get(key) || []
  list.push({ ts: Date.now(), text })
  const cutoff = Date.now() - SPAM_WINDOW
  recentMessages.set(key, list.filter(m => m.ts > cutoff).slice(-15))
}

// Cantidad de mensajes del usuario dentro de la ventana actual.
export const recentCount = (chatId, user, windowMs = 5000) => {
  const cutoff = Date.now() - windowMs
  return (recentMessages.get(KEY(chatId, user)) || []).filter(m => m.ts > cutoff).length
}

// Veces que repitió exactamente el mismo texto dentro de la ventana.
export const repeatCount = (chatId, user, text, windowMs = SPAM_WINDOW) => {
  const cutoff = Date.now() - windowMs
  return (recentMessages.get(KEY(chatId, user)) || [])
    .filter(m => m.ts > cutoff && m.text === text).length
}

// Anota la entrada de un usuario al grupo (para antibot).
export const noteJoin = (chatId, user) => {
  joins.set(KEY(chatId, user), Date.now())
}

// Segundos desde que entró al grupo (Infinity si no hay registro).
export const secondsSinceJoin = (chatId, user) => {
  const ts = joins.get(KEY(chatId, user))
  if (!ts) return Infinity
  return (Date.now() - ts) / 1000
}

// Limpieza periódica de entradas viejas para no crecer sin fin.
setInterval(() => {
  const cutoff = Date.now() - SPAM_WINDOW * 3
  for (const [key, list] of recentMessages) {
    const fresh = list.filter(m => m.ts > cutoff)
    if (fresh.length === 0) recentMessages.delete(key)
    else recentMessages.set(key, fresh)
  }
  const joinCutoff = Date.now() - 60 * 60 * 1000
  for (const [key, ts] of joins) {
    if (ts < joinCutoff) joins.delete(key)
  }
}, CLEANUP_EVERY).unref?.()
