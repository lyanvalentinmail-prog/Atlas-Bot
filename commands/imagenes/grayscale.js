// ╭────────────────────────────────────────────
// │  COMANDO » grayscale » blanco y negro.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'grayscale',
  alias: ['bn', 'blanconegro'],
  category: 'imagenes',
  description: 'Convierte una imagen a escala de grises.',
  usage: 'grayscale (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command }) => {
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.greyscale().jpeg({ quality: 90 })
    })
  }
}
