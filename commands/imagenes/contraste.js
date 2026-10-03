// ╭────────────────────────────────────────────
// │  COMANDO » contraste » ajusta el contraste.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'contraste',
  alias: ['contrast'],
  category: 'imagenes',
  description: 'Ajusta el contraste de una imagen.',
  usage: 'contraste [0.2-3] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    let factor = parseFloat(args[0])
    if (!factor || factor < 0.2 || factor > 3) factor = 1.5
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.linear(factor, -(128 * factor) + 128).jpeg({ quality: 90 }),
      caption: `> こ Contraste ×${factor}.`
    })
  }
}
