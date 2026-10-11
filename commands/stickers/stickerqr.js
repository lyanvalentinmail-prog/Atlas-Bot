// ╭────────────────────────────────────────────
// │  COMANDO » stickerqr » QR convertido en sticker.
// ╰────────────────────────────────────────────
import { getSharp } from '../../lib/image.js'

export default {
  name: 'stickerqr',
  alias: ['qrsticker'],
  category: 'stickers',
  description: 'Convierte un código QR en sticker.',
  usage: 'stickerqr <texto>',

  run: async ({ sock, msg, chatId, text, prefix }) => {
    if (!text) return sock.sendMessage(chatId, { text: `» Uso: ${prefix}stickerqr <texto>` }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    try {
      const url = 'https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=' + encodeURIComponent(text)
      const respuesta = await fetch(url)
      const buffer = Buffer.from(await respuesta.arrayBuffer())
      const webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255 } }).webp({ quality: 95 }).toBuffer()

      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude crear el sticker QR (sin internet o error del servicio).' }, { quoted: msg })
    }
  }
}
