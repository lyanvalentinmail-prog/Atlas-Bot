// ╭────────────────────────────────────────────
// │  COMANDO » toaudio » sticker animado a audio
// │  (los webp no llevan audio; se avisa a tiempo).
// ╰────────────────────────────────────────────

export default {
  name: 'toaudio',
  alias: ['stickeraudio'],
  category: 'stickers',
  description: 'Convierte un sticker animado en audio cuando sea compatible.',
  usage: 'toaudio (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const st = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!st) return sock.sendMessage(chatId, { text: '» Responde a un sticker animado.' }, { quoted: msg })

    if (!st.isAnimated) {
      return sock.sendMessage(chatId, { text: '> Este sticker no es animado: no tiene pista de audio.' }, { quoted: msg })
    }

    await sock.sendMessage(chatId, {
      text: '> Los stickers webp no contienen sonido; prueba !togif o !tovideo para convertir la animación.'
    }, { quoted: msg })
  }
}
