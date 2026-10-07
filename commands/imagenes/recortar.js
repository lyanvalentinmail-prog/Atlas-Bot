// ╭────────────────────────────────────────────
// │  COMANDO » recortar » recorte centrado.
// ╰────────────────────────────────────────────
import { findImageMessage, downloadImage, getSharp } from '../../lib/image.js'

export default {
  name: 'crop',
  alias: ['cortar', 'recortar'],
  category: 'imagenes',
  description: 'Recorta una imagen (cuadrado centrado).',
  usage: 'crop (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix }) => {
    if (!findImageMessage(msg)) return sock.sendMessage(chatId, { text: '» Responde a una imagen para recortarla.' }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar esa imagen.' }, { quoted: msg })

    try {
      const meta = await sharp(buffer).metadata()
      const lado = Math.min(meta.width || 0, meta.height || 0)
      const left = Math.floor(((meta.width || lado) - lado) / 2)
      const top = Math.floor(((meta.height || lado) - lado) / 2)

      const salida = await sharp(buffer)
        .extract({ left, top, width: lado, height: lado })
        .jpeg({ quality: 90 })
        .toBuffer()

      await sock.sendMessage(chatId, { image: salida, caption: `> こ Recorte cuadrado centrado (${lado}×${lado}).` }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude recortar esa imagen.' }, { quoted: msg })
    }
  }
}
