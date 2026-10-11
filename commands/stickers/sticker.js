// ╭────────────────────────────────────────────
// │  COMANDO » sticker
// │  Convierte una imagen en sticker.
// │  Envía una imagen con el comentario !sticker
// │  o responde a una imagen con !sticker.
// │
// │  NOTA: necesita la librería "sharp" para
// │  convertir a webp. El comando la detecta solo:
// │      npm install sharp
// ╰────────────────────────────────────────────
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { unwrapMessage, getQuoted } from '../../lib/utils.js'

export default {
  name: 'sticker',
  alias: ['s', 'fig'],
  category: 'stickers',
  description: 'Convierte una imagen en sticker.',
  usage: 'sticker (respondiendo a una imagen)',

  run: async ({ sock, msg, chatId, reply }) => {
    // Busca la imagen: en el propio mensaje o en el mensaje citado
    const quoted = getQuoted(msg)
    const source = quoted
      ? { key: { remoteJid: chatId, id: quoted.id, participant: quoted.sender }, message: quoted.message }
      : msg
    const content = unwrapMessage(source.message)

    if (!content?.imageMessage) {
      return reply('» Envía una imagen con el texto *!sticker* o responde a una imagen con *!sticker*.')
    }

    // La conversión a webp requiere sharp (instalación opcional)
    let sharp
    try {
      sharp = (await import('sharp')).default
    } catch {
      return reply(
        '> Para crear stickers falta la librería *sharp*.\n' +
        '> Instálala con: `npm install sharp`\n' +
        '> y reinicia el bot.'
      )
    }

    try {
      const buffer = await downloadMediaMessage(
        source, 'buffer', {},
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      )
      const webp = await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 80 })
        .toBuffer()

      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg })
    } catch {
      await reply('» No pude crear el sticker. Verifica que la imagen sea válida.')
    }
  }
}
