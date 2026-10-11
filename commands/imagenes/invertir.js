// ╭────────────────────────────────────────────
// │  COMANDO » invertir » colores invertidos.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'invert',
  alias: ['invertcolors', 'invertir'],
  category: 'imagenes',
  description: 'Invierte los colores de una imagen.',
  usage: 'invert (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command }) => {
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.negate({ alpha: false }).jpeg({ quality: 90 })
    })
  }
}
