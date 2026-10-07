// ╭────────────────────────────────────────────
// │  COMANDO » negativo » como negativo de foto.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'negative',
  alias: ['negativo'],
  category: 'imagenes',
  description: 'Crea un negativo de la imagen.',
  usage: 'negative (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command }) => {
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.negate({ alpha: false }).modulate({ saturation: 1.2 }).jpeg({ quality: 90 })
    })
  }
}
