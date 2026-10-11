// ╭────────────────────────────────────────────
// │  COMANDO » blur » desenfoque (need sharp).
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'blur',
  alias: ['desenfoque', 'blurry'],
  category: 'imagenes',
  description: 'Aplica desenfoque a una imagen.',
  usage: 'blur (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    const nivel = Math.min(20, Math.max(1, Math.abs(parseInt(args[0], 10)) || 8))
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: (img) => img.blur(nivel).jpeg({ quality: 85 })
    })
  }
}
