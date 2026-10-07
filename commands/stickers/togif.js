// ╭────────────────────────────────────────────
// │  COMANDO » togif » sticker animado a GIF.
// │  Usa sharp: convierte fotogramas; como
// │  fallback envía la imagen fija.
// ╰────────────────────────────────────────────
import { getSharp, downloadImage } from '../../lib/image.js'

export default {
  name: 'togif',
  alias: ['stickergif', 'agif'],
  category: 'stickers',
  description: 'Convierte un sticker animado en GIF.',
  usage: 'togif (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const st = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!st) return sock.sendMessage(chatId, { text: '» Responde a un sticker animado.' }, { quoted: msg })

    if (!st.isAnimated) {
      return sock.sendMessage(chatId, { text: '> Este sticker no es animado: no hay GIF que crear.' }, { quoted: msg })
    }

    const sharp = await getSharp()
    if (!sharp) {
      return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })
    }

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar ese sticker.' }, { quoted: msg })

    try {
      const gif = await sharp(buffer, { animated: true }).gif().toBuffer()
      await sock.sendMessage(chatId, {
        video: gif,
        gifPlayback: true,
        caption: '> こ GIF listo.'
      }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude convertir ese sticker (quizá mi servidor no soporta GIF).' }, { quoted: msg })
    }
  }
}
