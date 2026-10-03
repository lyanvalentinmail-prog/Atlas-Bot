// ╭────────────────────────────────────────────
// │  ATLAS BOT · Ayudas para imágenes
// │  Descarga imágenes citadas y carga "sharp"
// │  SOLO si está instalada (dependencia
// │  opcional, igual que en !sticker).
// ╰────────────────────────────────────────────
import { downloadMediaMessage } from '@whiskeysockets/baileys'

// Busca un imageMessage en el mensaje citado o en el propio mensaje.
export const findImageMessage = (msg) => {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  return (
    quoted?.imageMessage ||
    msg.message?.imageMessage ||
    quoted?.stickerMessage ||
    null
  )
}

// Descarga la imagen (o sticker) como Buffer.
// Devuelve null si no se puede (media expirada, formato raro, etc.).
export const downloadImage = async (msg) => {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const fullMessage = quoted
    ? { ...msg, message: quoted }
    : msg
  try {
    return await downloadMediaMessage(fullMessage, 'buffer', {})
  } catch {
    return null
  }
}

// Carga sharp de forma dinámica. Devuelve null si no está instalada.
export const getSharp = async () => {
  try {
    return (await import('sharp')).default
  } catch {
    return null
  }
}

// Flujo estándar de los comandos de "imagenes":
//  1. Obtiene la imagen del mensaje (o avisa).
//  2. Procesa con sharp (o avisa que falta la dependencia).
//  3. Envía la imagen resultante (o el error amigable).
export const processImage = async ({ sock, msg, chatId, prefix, command, apply, caption }) => {
  if (!findImageMessage(msg)) {
    return sock.sendMessage(chatId, {
      text: `» Responde a una imagen para usar ${prefix}${command}.`
    }, { quoted: msg })
  }

  const sharp = await getSharp()
  if (!sharp) {
    return sock.sendMessage(chatId, {
      text: '> Necesito la librería *sharp* para editar imágenes.\n> Instálala con: npm install sharp'
    }, { quoted: msg })
  }

  const buffer = await downloadImage(msg)
  if (!buffer) {
    return sock.sendMessage(chatId, {
      text: '> No pude descargar esa imagen. Reenvíala e inténtalo de inmediato.'
    }, { quoted: msg })
  }

  try {
    const result = await apply(sharp(buffer), sharp)
    const output = Buffer.isBuffer(result) ? result : await result.toBuffer()
    await sock.sendMessage(chatId, {
      image: output,
      caption: caption || `> こ Listo · ${command}`
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(chatId, {
      text: '> No pude procesar esa imagen. Intenta con otra.'
    }, { quoted: msg })
  }
}
