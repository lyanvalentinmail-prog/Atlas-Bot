// ╭────────────────────────────────────────────
// │  COMANDO » stickertexto » texto a sticker.
// ╰────────────────────────────────────────────
import { getSharp } from '../../lib/image.js'

const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default {
  name: 'stickertext',
  alias: ['stext', 'stickerletras', 'stickertexto'],
  category: 'stickers',
  description: 'Convierte un texto en sticker.',
  usage: 'stickertext <texto>',

  run: async ({ sock, msg, chatId, text, prefix }) => {
    if (!text) return sock.sendMessage(chatId, { text: `» Uso: ${prefix}stickertext <texto>` }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    try {
      const limpio = text.trim().slice(0, 60)
      const tam = 64
      const lineas = []
      for (let i = 0; i < limpio.length; i += 12) lineas.push(limpio.slice(i, i + 12))
      const alto = 512, ancho = 512

      const svg = Buffer.from(
        `<svg width="${ancho}" height="${alto}">` +
        `<rect width="100%" height="100%" rx="80" fill="#7a6cff"/>` +
        lineas.map((l, i) =>
          `<text x="${ancho / 2}" y="${alto / 2 + (i - (lineas.length - 1) / 2) * (tam + 10) + tam / 3}" ` +
          `font-family="DejaVu Sans, sans-serif" font-size="${tam}" fill="white" text-anchor="middle" font-weight="bold">${escapeXml(l)}</text>`
        ).join('') +
        '</svg>'
      )

      const webp = await sharp(svg).webp({ quality: 90 }).toBuffer()
      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude crear el sticker de texto.' }, { quoted: msg })
    }
  }
}
