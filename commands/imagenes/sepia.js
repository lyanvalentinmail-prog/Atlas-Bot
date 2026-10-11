// ╭────────────────────────────────────────────
// │  COMANDO » sepia » tono antiguo.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'sepia',
  alias: ['vintage', 'antiguo'],
  category: 'imagenes',
  description: 'Aplica un efecto sepia.',
  usage: 'sepia (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command }) => {
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img
        .recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131]
        ])
        .jpeg({ quality: 90 })
    })
  }
}
