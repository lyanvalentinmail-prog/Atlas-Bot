// ╭────────────────────────────────────────────
// │  COMANDO » marco » borde decorativo.
// ╰────────────────────────────────────────────
import { processImage } from '../../lib/image.js'

export default {
  name: 'marco',
  alias: ['frame', 'borde'],
  category: 'imagenes',
  description: 'Añade un marco decorativo.',
  usage: 'marco [color opcional] (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, command, args }) => {
    const color = (args[0] || '').match(/^#?[0-9a-fA-F]{6}$/)
      ? (args[0].startsWith('#') ? args[0] : `#${args[0]}`)
      : '#7a6cff'
    await processImage({
      sock, msg, chatId, prefix, command,
      apply: async (img, sharp) => {
        const meta = await img.metadata()
        const w = meta.width || 512, h = meta.height || 512
        const borde = Math.max(10, Math.round(Math.min(w, h) * 0.05))
        const svg = Buffer.from(
          `<svg width="${w + borde * 2}" height="${h + borde * 2}">` +
          `<rect width="100%" height="100%" fill="${color}"/>` +
          `<rect x="${borde / 2}" y="${borde / 2}" width="${w + borde}" height="${h + borde}" fill="black" fill-opacity="0.25"/>` +
          '</svg>'
        )
        const base = await img.jpeg({ quality: 90 }).toBuffer()
        return sharp(svg)
          .composite([{ input: base, top: borde, left: borde }])
          .jpeg({ quality: 90 })
      }
    })
  }
}
