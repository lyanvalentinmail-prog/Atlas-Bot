// ╭────────────────────────────────────────────
// │  COMANDO » rotate » gira la imagen.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'rotate',
  alias: ['girar', 'rotar'],
  category: 'imagenes',
  description: 'Gira una imagen (90/180/270).',
  usage: 'rotate [grados] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    const grados = [90, 180, 270].includes(Math.abs(parseInt(args[0], 10))) ? Math.abs(parseInt(args[0], 10)) : 90
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.rotate(grados).jpeg({ quality: 90 }),
      caption: `> こ Girada ${grados}°.`
    })
  }
}
