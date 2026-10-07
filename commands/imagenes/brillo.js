// ╭────────────────────────────────────────────
// │  COMANDO » brillo » ajusta el brillo.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'brightness',
  alias: ['luz', 'brillo'],
  category: 'imagenes',
  description: 'Ajusta el brillo de una imagen.',
  usage: 'brightness [0.2-3] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    let factor = parseFloat(args[0])
    if (!factor || factor < 0.2 || factor > 3) factor = 1.4
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.modulate({ brightness: factor }).jpeg({ quality: 90 }),
      caption: `> こ Brillo ×${factor}.`
    })
  }
}
