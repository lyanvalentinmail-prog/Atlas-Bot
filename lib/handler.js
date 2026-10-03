// ╭────────────────────────────────────────────
// │  ATLAS BOT · Manejador de mensajes
// │  Recibe cada mensaje entrante, aplica la
// │  moderación del grupo, reparte el juego
// │  activo, verifica el prefijo, busca el
// │  comando, valida permisos y lo ejecuta.
// ╰────────────────────────────────────────────
import { config, fmt } from '../config.js'
import { logger } from './logger.js'
import { registerUser, getGroupSettings } from './database.js'
import { getGame, endGame, touchGame } from './games.js'
import {
  trackMessage, repeatCount, recentCount, secondsSinceJoin
} from './trackers.js'
import {
  getMessageText,
  getSender,
  getNumber,
  findParticipant,
  isAdmin,
  isOwnerNumber
} from './utils.js'

// Filtro NSFW básico (dominios + palabras clave) para !antinsfw
const NSFW_RE = /(porn(hub|o)?|xvideo|xnxx|redtube|onlyfans|hentai|pack[s]?\s+(de|hot)|contenido\s+adulto)/i

export async function handleMessage(sock, msg, ctx) {
  const { commands, categories } = ctx

  // ── « Filtros básicos » ───────────────────
  if (!msg?.message || !msg.key?.remoteJid) return
  const chatId = msg.key.remoteJid
  if (chatId === 'status@broadcast') return // estados de WhatsApp

  const body = getMessageText(msg)
  if (!body) return

  // ── « Datos del mensaje » ─────────────────
  const isGroup = chatId.endsWith('@g.us')
  const sender = getSender(msg, isGroup)
  const isOwner = isOwnerNumber(config, sender) || msg.key.fromMe === true

  // Registra al usuario para el contador del menú
  registerUser(sender)

  // Ajustes y datos del grupo (solo si es grupo)
  const settings = isGroup ? getGroupSettings(chatId) : null
  const senderNumber = getNumber(sender)
  const groupPrefixChars = settings?.groupPrefix ? [...settings.groupPrefix] : []
  const startsWithPrefixChar = [...groupPrefixChars, ...config.prefix]
    .some(char => body.startsWith(char))

  // ── « Moderación del grupo » ──────────────
  // Vetados, silenciados, chat cerrado, anti-link,
  // anti-spam, anti-flood, anti-bot, anti-NSFW.
  if (isGroup && settings && !msg.key.fromMe && !isOwner) {
    const senderJid = sender
    const deleteMsg = async () => {
      try { await sock.sendMessage(chatId, { delete: msg.key }) } catch {}
    }

    // Cuantifica la actividad del usuario (para spam/flood/antibot)
    trackMessage(chatId, sender, body)

    // 1) Vetados » se borra y se vuelve a expulsar
    if (settings.banned.includes(senderNumber)) {
      await deleteMsg()
      try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove') } catch {}
      return
    }

    // 2) Silenciados » se borra lo que escriban
    if (settings.muted.includes(senderNumber)) {
      await deleteMsg()
      return
    }

    // Consulta perezosa de metadata (solo cuando hace falta)
    let cachedMeta = null
    const getMeta = async () => {
      if (!cachedMeta) {
        try { cachedMeta = await sock.groupMetadata(chatId) } catch { cachedMeta = { participants: [] } }
      }
      return cachedMeta
    }
    const senderIsAdminNow = async () =>
      isAdmin(findParticipant(await getMeta(), sender))

    // 3) Chat silenciado » solo escriben admins
    if ((settings.mutedChat === -1 || settings.mutedChat > Date.now())) {
      if (!(await senderIsAdminNow())) {
        await deleteMsg()
        return
      }
    }

    // 4) Anti-link » según configuración del grupo
    if (/chat\.whatsapp\.com\//i.test(body)) {
      const enabled = settings.antilink || settings.antilink2.on
      if (enabled && !(await senderIsAdminNow())) {
        // Modo según !antilink2 (el !antilink clásico equivale a "borrar")
        const mode = settings.antilink2.on ? settings.antilink2.mode : 'borrar'
        if (mode === 'borrar' || mode === 'expulsar') await deleteMsg()
        if (mode === 'expulsar') {
          try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove') } catch {}
        }
        await sock.sendMessage(chatId, {
          text: fmt(config.messages.antilink, { user: `@${senderNumber}` }),
          mentions: [sender]
        }).catch(() => null)
        return
      }
    }

    // 5) Anti-spam » repetir el mismo mensaje muchas veces
    if (settings.antispam && repeatCount(chatId, sender, body) >= 4) {
      await deleteMsg()
      await sock.sendMessage(chatId, {
        text: `> @${senderNumber}, deja de repetir el mismo mensaje (anti-spam).`,
        mentions: [sender]
      }).catch(() => null)
      return
    }

    // 6) Anti-flood » ráfaga de mensajes
    if (settings.antiflood && recentCount(chatId, sender, 4000) >= 7) {
      await deleteMsg()
      await sock.sendMessage(chatId, {
        text: `> @${senderNumber}, calmado: escribes demasiado rápido (anti-flood).`,
        mentions: [sender]
      }).catch(() => null)
      return
    }

    // 7) Anti-bot » mucha actividad justo después de entrar
    if (settings.antibot &&
        secondsSinceJoin(chatId, sender) < 25 &&
        recentCount(chatId, sender, 25000) >= 4) {
      await deleteMsg()
      try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove') } catch {}
      await sock.sendMessage(chatId, {
        text: `> Anti-bot: expulsé a @${senderNumber} por actividad sospechosa al entrar.`,
        mentions: [sender]
      }).catch(() => null)
      return
    }

    // 8) Anti-NSFW » dominios y palabras filtradas
    if (settings.antinsfw && NSFW_RE.test(body)) {
      await deleteMsg()
      return
    }
  }

  // ── « Juegos con estado » ─────────────────
  // Un juego activo (ahorcado, trivia...) recibe
  // los mensajes normales del chat hasta que acabe.
  // Los comandos (con prefijo) nunca se interceptan.
  if (!msg.key.fromMe && !startsWithPrefixChar) {
    const game = getGame(chatId)
    if (game) {
      try {
        touchGame(chatId)
        const consumido = await game.onInput({ sock, msg, chatId, sender, body: body.trim(), senderNumber })
        if (consumido) return
      } catch (error) {
        logger.error('Error en el minijuego:', error)
        endGame(chatId)
      }
    }
  }

  // ── « Prefijo » ───────────────────────────
  // Los grupos pueden tener su propio prefijo (setprefix).
  const usedPrefix = [...groupPrefixChars, ...config.prefix].find(char => body.startsWith(char))
  if (!usedPrefix) return

  const args = body.slice(usedPrefix.length).trim().split(/\s+/).filter(Boolean)
  const commandName = (args.shift() || '').toLowerCase()
  if (!commandName) return

  // Atajo para responder citando el mensaje original.
  const reply = (text, extra = {}) =>
    sock.sendMessage(chatId, { text: String(text), ...extra }, { quoted: msg })

  // ── « Buscar el comando » ─────────────────
  const command = commands.get(commandName)
  if (!command) {
    if (config.messages.commandNotFound) {
      await reply(fmt(config.messages.commandNotFound, { prefix: usedPrefix }))
    }
    return
  }

  // ── « Datos del grupo (solo si hacen falta) » ──
  let groupMetadata = null
  let senderIsAdmin = false
  let botIsAdmin = false

  if (isGroup && (command.groupOnly || command.adminOnly || command.botAdminOnly)) {
    try {
      groupMetadata = await sock.groupMetadata(chatId)
      senderIsAdmin = isAdmin(findParticipant(groupMetadata, sender))
      const botData =
        findParticipant(groupMetadata, sock.user?.lid || '') ||
        findParticipant(groupMetadata, sock.user?.id || '')
      botIsAdmin = isAdmin(botData)
    } catch (error) {
      logger.warn(`No se pudo leer la información del grupo: ${error.message}`)
    }
  }

  // ── « Permisos » ──────────────────────────
  if (command.ownerOnly && !isOwner) return reply(config.messages.ownerOnly)
  if (command.groupOnly && !isGroup) return reply(config.messages.groupOnly)
  if (command.adminOnly && !senderIsAdmin && !isOwner) return reply(config.messages.adminOnly)
  if (command.botAdminOnly && isGroup && !botIsAdmin) return reply(config.messages.botAdminOnly)

  // Comandos restringidos por el grupo (!soloadmins)
  if (isGroup && settings?.soloAdmins?.includes(command.name) &&
      !senderIsAdmin && !isOwner) {
    return reply('» En este grupo ese comando es solo para administradores.')
  }

  logger.command(
    `${usedPrefix}${commandName} » ${msg.pushName || getNumber(sender)} ` +
    `(${isGroup ? 'grupo' : 'privado'})`
  )

  // ── « Ejecutar el comando » ───────────────
  try {
    await command.run({
      // Datos principales
      sock,            // Conexión de Baileys (socket)
      msg,             // Mensaje original completo
      args,            // Array de argumentos: ["abrir"]
      text: args.join(' '), // Argumentos como texto: "abrir"
      command: commandName,
      prefix: usedPrefix,

      // Configuración y utilidades
      config,          // Configuración central (config.js)
      fmt,             // Reemplaza {marcadores} en textos
      reply,           // Responder citando el mensaje

      // Contexto del chat
      chatId,          // JID del chat o grupo
      sender,          // JID del remitente
      isOwner,         // El remitente es el dueño
      isGroup,         // El chat es un grupo
      groupMetadata,   // Datos del grupo (si aplica)
      isAdmin: senderIsAdmin, // El remitente es admin del grupo
      isBotAdmin: botIsAdmin, // El bot es admin del grupo

      // Registro global de comandos
      commands,        // Map: nombre/alias -> comando
      categories       // Map: categoría -> [comandos]
    })
  } catch (error) {
    logger.error(`Error en el comando "${commandName}":`, error)
    await reply(config.messages.error).catch(() => null)
  }
}
