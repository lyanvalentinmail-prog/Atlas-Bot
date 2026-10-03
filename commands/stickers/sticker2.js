// ╭────────────────────────────────────────────
// │  COMANDO » sticker2 » sticker con tu sello:
// │  autor/paquete personalizados (need sharp).
// ╰────────────────────────────────────────────
import { downloadImage, findImageMessage, getSharp } from '../../lib/image.js'

export default {
  name: 'sticker2',
  alias: ['stickerpro', 'stickerpersonal'],
  category: 'stickers',
  description: 'Crea un sticker con una imagen o GIF.',
  usage: 'sticker2 [pack | autor] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, text, config }) => {
    if (!findImageMessage(msg)) {
      return sock.sendMessage(chatId, { text: `» Responde a una imagen.\n» Opcional: ${prefix}sticker2 彡 ATLAS | por ti` }, { quoted: msg })
    }

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar esa imagen.' }, { quoted: msg })

    try {
      const webp = await sharp(buffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer()

      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg })
      if (text) {
        await sock.sendMessage(chatId, {
          text: `> Sello: *${text.trim().slice(0, 80)}*`
        }, { quoted: msg })
      }
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude crear el sticker.' }, { quoted: msg })
    }
  }
}
