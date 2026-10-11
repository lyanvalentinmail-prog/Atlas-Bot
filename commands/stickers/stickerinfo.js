// ╭────────────────────────────────────────────
// │  COMANDO » stickerinfo » datos del webp.
// ╰────────────────────────────────────────────
import { downloadImage } from '../../lib/image.js'
import { formatBytes } from '../../lib/utils.js'

export default {
  name: 'stickerinfo',
  alias: ['infosticker'],
  category: 'stickers',
  description: 'Muestra información de un sticker.',
  usage: 'stickerinfo (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const st = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!st) return sock.sendMessage(chatId, { text: '» Responde a un sticker para ver su info.' }, { quoted: msg })

    const buffer = await downloadImage(msg)

    await sock.sendMessage(chatId, {
      text: [
        '╭─「 STICKER INFO 」',
        `│ » Animado  : ${st.isAnimated ? 'sí' : 'no'}`,
        `│ » Tipo     : ${st.mimetype || 'image/webp'}`,
        `│ » Tamaño   : ${buffer ? formatBytes(buffer.length) : '—'}`,
        `│ » WxH      : ${st.width || '?'}×${st.height || '?'}`,
        `│ » Emoji    : ${st.stickerSentTs ? 'con sello de tiempo' : '—'}`,
        '╰─────────────'
      ].join('\n')
    }, { quoted: msg })
  }
}
