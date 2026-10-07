// ╭────────────────────────────────────────────
// │  COMANDO » pack » datos del paquete del sticker.
// ╰────────────────────────────────────────────

export default {
  name: 'pack',
  alias: ['paquete', 'stickerpack'],
  category: 'stickers',
  description: 'Muestra información del paquete de un sticker.',
  usage: 'pack (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const st = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!st) return sock.sendMessage(chatId, { text: '» Responde a un sticker para ver su paquete.' }, { quoted: msg })

    await sock.sendMessage(chatId, {
      text: [
        '╭─「 PACK 」',
        `│ » WhatsApp oculta el autor que trae el sticker`,
        `│ » Tipo      : ${st.mimetype || 'image/webp'}`,
        `│ » Animado   : ${st.isAnimated ? 'sí' : 'no'}`,
        '╰─────────────',
        '> Para ponerle tu sello úsalo con: !take nombre|autor'
      ].join('\n')
    }, { quoted: msg })
  }
}
