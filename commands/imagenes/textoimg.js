// ╭────────────────────────────────────────────
// │  COMANDO » textoimg » texto sobre la imagen.
// ╰────────────────────────────────────────────
import { findImageMessage, downloadImage, getSharp } from '../../lib/image.js'

const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default {
  name: 'textoimg',
  alias: ['textoimagen', 'imgtexto'],
  category: 'imagenes',
  description: 'Añade texto sobre una imagen.',
  usage: 'textoimg <texto> (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, prefix, text }) => {
    if (!text) return sock.sendMessage(chatId, { text: `» Uso: ${prefix}textoimg <texto> (respondiendo a una imagen)` }, { quoted: msg })
    if (!findImageMessage(msg)) return sock.sendMessage(chatId, { text: '» Responde a una imagen para escribir sobre ella.' }, { quoted: msg })

    const sharp = await getSharp()
    if (!sharp) return sock.sendMessage(chatId, { text: '> Necesito la librería *sharp*.\n> Instálala con: npm install sharp' }, { quoted: msg })

    const buffer = await downloadImage(msg)
    if (!buffer) return sock.sendMessage(chatId, { text: '> No pude descargar esa imagen.' }, { quoted: msg })

    try {
      const meta = await sharp(buffer).metadata()
      const w = meta.width || 512, h = meta.height || 512
      const tam = Math.max(18, Math.round(w / 14))
      const lineas = []
      const maxChars = Math.floor(w / (tam * 0.6))
      for (let i = 0; i < text.length; i += maxChars) lineas.push(text.slice(i, i + maxChars))

      const svg = Buffer.from(
        `<svg width="${w}" height="${h}">` +
        lineas.map((l, i) =>
          `<text x="${w / 2}" y="${h / 2 + (i - (lineas.length - 1) / 2) * (tam + 8) + tam / 3}" ` +
          `font-family="DejaVu Sans, sans-serif" font-size="${tam}" fill="white" stroke="black" stroke-width="3" ` +
          `paint-order="stroke" text-anchor="middle" font-weight="bold">${escapeXml(l)}</text>`
        ).join('') +
        '</svg>'
      )

      const salida = await sharp(buffer)
        .composite([{ input: svg }])
        .jpeg({ quality: 90 })
        .toBuffer()

      await sock.sendMessage(chatId, { image: salida, caption: '> こ Texto agregado.' }, { quoted: msg })
    } catch {
      await sock.sendMessage(chatId, { text: '> No pude escribir sobre esa imagen.' }, { quoted: msg })
    }
  }
}
