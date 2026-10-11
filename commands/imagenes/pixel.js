// ╭────────────────────────────────────────────
// │  COMANDO » pixel » efecto pixelado.
// ╰────────────────────────────────────────────
import { findImageMessage, downloadImage, getSharp } from '../../lib/image.js'

export default {
  name: 'pixel',
  alias: ['pixelar', 'pixelfx'],
  category: 'imagenes',
  description: 'Aplica efecto pixelado.',
  usage: 'pixel [tamaño] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, args }) => {
    if (!findImageMessage(msg)) return sock.sendMessage(chatId, { text: '» Responde a una imagen para pixelarla.' }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar esa imagen.' }, { quoted: msg })

    try {
      const meta = await sharp(buffer).metadata()
      const ancho = meta.width || 512
      const bloque = Math.min(64, Math.max(4, Math.abs(parseInt(args[0], 10)) || 16))
      const mini = Math.max(1, Math.floor(ancho / bloque))

      const salida = await sharp(buffer)
        .resize(mini, null, { kernel: 'nearest' })
        .resize(ancho, null, { kernel: 'nearest' })
        .jpeg({ quality: 90 })
        .toBuffer()

      await sock.sendMessage(chatId, { image: salida, caption: '> こ Efecto pixelado.' }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude pixelar esa imagen.' }, { quoted: msg })
    }
  }
}
