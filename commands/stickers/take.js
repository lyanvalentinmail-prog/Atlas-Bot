// ╭────────────────────────────────────────────
// │  COMANDO » take » autor/nombre a tu gusto.
// ╰────────────────────────────────────────────
import { getSharp } from '../../lib/image.js'
import { downloadImage } from '../../lib/image.js'

export default {
  name: 'take',
  alias: ['robsticker', 'adueñar'],
  category: 'stickers',
  description: 'Cambia el autor y nombre de un sticker.',
  usage: 'take pack|autor (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId, text, prefix }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted?.stickerMessage && !msg.message?.stickerMessage) {
      return sock.sendMessage(chatId, { text: '» Responde a un sticker para reclamarlo.' }, { quoted: msg })
    }

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar ese sticker.' }, { quoted: msg })

    try {
      let webp = buffer
      const sharp = await getSharp()
      if (sharp) webp = await sharp(buffer).webp({ quality: 90 }).toBuffer()

      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg })
      if (text) {
        await sock.sendMessage(chatId, {
          text: `> Nuevo sello: *${text.trim().slice(0, 80)}*\n> (El sticker va sin metadatos viejos.)`
        }, { quoted: msg })
      }
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude reclamar ese sticker.' }, { quoted: msg })
    }
  }
}
