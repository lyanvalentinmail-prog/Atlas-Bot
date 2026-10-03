// ╭────────────────────────────────────────────
// │  ATLAS BOT · Manejador de mensajes
// │  Recibe cada mensaje entrante, verifica el
// │  prefijo, busca el comando, valida permisos
// │  y lo ejecuta.
// ╰────────────────────────────────────────────
import { config, fmt } from '../config.js'
import { logger } from './logger.js'
import {
  getMessageText,
  getSender,
  getNumber,
  findParticipant,
  isAdmin,
  isOwnerNumber
} from './utils.js'

export async function handleMessage(sock, msg, ctx) {
  const { commands, categories } = ctx

  // ── « Filtros básicos » ───────────────────
  if (!msg?.message || !msg.key?.remoteJid) return
  const chatId = msg.key.remoteJid
  if (chatId === 'status@broadcast') return // estados de WhatsApp

  const body = getMessageText(msg)
  if (!body) return

  // ── « Prefijo » ───────────────────────────
  const usedPrefix = [...config.prefix].find(char => body.startsWith(char))
  if (!usedPrefix) return

  const args = body.slice(usedPrefix.length).trim().split(/\s+/).filter(Boolean)
  const commandName = (args.shift() || '').toLowerCase()
  if (!commandName) return

  // ── « Datos del mensaje » ─────────────────
  const isGroup = chatId.endsWith('@g.us')
  const sender = getSender(msg, isGroup)
  const isOwner = isOwnerNumber(config, sender) || msg.key.fromMe === true

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
