// ╭────────────────────────────────────────────
// │  COMANDO » flip » espejo horizontal.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'flip',
  alias: ['espejo', 'voltear'],
  category: 'imagenes',
  description: 'Invierte una imagen horizontalmente.',
  usage: 'flip (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command }) => {
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.flop().jpeg({ quality: 90 })
    })
  }
}
