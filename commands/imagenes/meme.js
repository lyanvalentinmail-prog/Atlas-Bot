// ╭────────────────────────────────────────────
// │  COMANDO » meme » texto arriba/abajo.
// │  Separa arriba y abajo con una barra: |
// ╰────────────────────────────────────────────
import { findImageMessage, downloadImage, getSharp } from '../../lib/image.js'

const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default {
  name: 'meme',
  alias: ['crearmeme', 'memegen'],
  category: 'imagenes',
  description: 'Crea un meme a partir de una imagen.',
  usage: 'meme <arriba>|<abajo> (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, text }) => {
    if (!text) return sock.sendMessage(chatId, { text: `» Uso: ${prefix}meme <texto arriba>|<texto abajo>\n» Ejemplo: ${prefix}meme cuando dices|que vienes en 5 min` }, { quoted: msg })
    if (!findImageMessage(msg)) return sock.sendMessage(chatId, { text: '» Responde a una imagen para el meme.' }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar esa imagen.' }, { quoted: msg })

    try {
      const meta = await sharp(buffer).metadata()
      const w = meta.width || 512, h = meta.height || 512
      const tam = Math.max(22, Math.round(w / 12))
      const [arriba = '', abajo = ''] = text.split('|').map(t => t.trim().toUpperCase())

      const dibujar = (t, y) => t
        ? `<text x="${w / 2}" y="${y}" font-family="DejaVu Sans, sans-serif" font-size="${tam}" fill="white" stroke="black" stroke-width="4" paint-order="stroke" text-anchor="middle" font-weight="bold">${escapeXml(t)}</text>`
        : ''

      const svg = Buffer.from(
        `<svg width="${w}" height="${h}">${dibujar(arriba, tam + 12)}${dibujar(abajo, h - 18)}</svg>`
      )

      const salida = await sharp(buffer)
        .composite([{ input: svg }])
        .jpeg({ quality: 90 })
        .toBuffer()

      await sock.sendMessage(chatId, { image: salida, caption: '> こ Meme listo.' }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude crear el meme.' }, { quoted: msg })
    }
  }
}
