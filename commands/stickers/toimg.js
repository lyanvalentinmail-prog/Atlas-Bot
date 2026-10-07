// ╭────────────────────────────────────────────
// │  COMANDO » toimg
// │  Convierte un sticker (webp) en imagen PNG.
// │  Usa la librería "sharp", que es OPCIONAL:
// │  si no está instalada, avisa sin romper nada.
// ╰────────────────────────────────────────────
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const TEMP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../tmp')

export default {
  name: 'toimg',
  alias: ['aimg', 'toimage', 'stickerimg'],
  category: 'stickers',
  description: 'Convierte un sticker en imagen (respóndelo).',
  usage: 'toimg (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const sticker = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!sticker) return sock.sendMessage(chatId, { text: '» Responde a un sticker para convertirlo.' }, { quoted: msg })

    // Intenta cargar sharp (opcional)
    let sharp = null
    try {
      sharp = (await import('sharp')).default
    } catch { /* sharp no instalado */ }

    // El media de un mensaje citado se descarga usando el mensaje completo
    const fullMessage = quoted?.stickerMessage
      ? { ...msg, message: quoted }
      : msg

    let buffer = null
    try {
      buffer = await downloadMediaMessage(fullMessage, 'buffer', {})
    } catch { /* pudo expirar del servidor */ }

    if (!buffer) {
      return sock.sendMessage(chatId, {
        text: '> No pude descargar ese sticker. Pide que lo reenvíen e inténtalo de inmediato.'
      }, { quoted: msg })
    }

    // Animado (webp animado): sharp lo convierte al primer fotograma
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true })

      if (!sharp) {
        return sock.sendMessage(chatId, {
          text: '> Necesito la librería *sharp* para convertir stickers.\n> Instálala con: npm install sharp'
        }, { quoted: msg })
      }

      const png = await sharp(buffer).png().toBuffer()
      await sock.sendMessage(chatId, {
        image: png,
        caption: '> こ Aquí está tu imagen.'
      }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, {
        text: '> No pude convertir ese sticker (los stickers animados se convierten en un fotograma fijo).'
      }, { quoted: msg })
    }
  }
}
