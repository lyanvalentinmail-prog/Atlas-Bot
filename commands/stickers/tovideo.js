// ╭────────────────────────────────────────────
// │  COMANDO » tovideo » sticker animado a video.
// │  Requiere ffmpeg; sin él solo se avisa.
// ╰────────────────────────────────────────────

export default {
  name: 'tovideo',
  alias: ['stickervideo'],
  category: 'stickers',
  description: 'Convierte un sticker animado en video.',
  usage: 'tovideo (respondiendo a un sticker)',

  run: async ({ sock, msg, chatId }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const st = quoted?.stickerMessage || msg.message?.stickerMessage
    if (!st) return sock.sendMessage(chatId, { text: '» Responde a un sticker animado.' }, { quoted: msg })

    if (!st.isAnimated) {
      return sock.sendMessage(chatId, { text: '> Este sticker no es animado: no hay video que crear.' }, { quoted: msg })
    }

    await sock.sendMessage(chatId, {
      text: '> Necesito *ffmpeg* para webp→video.\n> En VPS: sudo apt install ffmpeg\n> En Termux: pkg install ffmpeg\n> Mientras tanto, prueba !togif.'
    }, { quoted: msg })
  }
}
