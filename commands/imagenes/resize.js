// ╭────────────────────────────────────────────
// │  COMANDO » resize » WxH o un solo lado.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'resize',
  alias: ['redimensionar', 'escalar'],
  category: 'imagenes',
  description: 'Cambia el tamaño de una imagen.',
  usage: 'resize 400x300 (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    const match = (args[0] || '').match(/^(\d{2,4})x(\d{2,4})$/) || (args[0] || '').match(/^(\d{2,4})$/)
    if (!match) {
      return sock.sendMessage(chatId, {
        text: `» Uso: ${prefix}resize <tamaño>\n» Ejemplos: ${prefix}resize 512 ・ ${prefix}resize 800x600`
      }, { quoted: msg })
    }

    const ancho = parseInt(match[1], 10)
    const alto = match[2] ? parseInt(match[2], 10) : ancho

    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.resize(ancho, alto, { fit: 'fill' }).png(),
      caption: `> こ ${ancho}×${alto} listo.`
    })
  }
}
