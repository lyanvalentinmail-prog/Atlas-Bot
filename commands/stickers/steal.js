// ╭────────────────────────────────────────────
// │  COMANDO » steal » guarda un sticker como
// │  imagen PNG en tu colección (respóndelo).
// ╰────────────────────────────────────────────
import { downloadImage, getSharp } from '../../lib/image.js'

export default {
  name: 'steal',
  alias: ['robarsticker', 'guardarst'],
  category: 'stickers',
  description: 'Guarda un sticker enviado al chat.',
  usage: 'steal (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted?.stickerMessage && !msg.message?.stickerMessage) {
      return sock.sendMessage(chatId, { text: '» Responde a un sticker para guardarlo.' }, { quoted: msg })
    }

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar ese sticker.' }, { quoted: msg })

    try {
      const sharp = await getSharp()
      if (!sharp) {
        return sock.sendMessage(chatId, {
          text: '> Necesito la librería *sharp* para convertirlo.\n> Instálala con: npm install sharp'
        }, { quoted: msg })
      }

      const png = await sharp(buffer).png().toBuffer()
      await sock.sendMessage(chatId, { image: png, caption: '> こ Sticker guardado como imagen.' }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> Los stickers animados se guardan como fotograma fijo.' }, { quoted: msg })
    }
  }
}
