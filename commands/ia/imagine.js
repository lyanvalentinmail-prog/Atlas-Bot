// ╭────────────────────────────────────────────
// │  COMANDO » imagine
// │  Genera una imagen con IA a partir de texto
// │  (Pollinations.ai: API gratuita sin registro).
// ╰────────────────────────────────────────────

export default {
  name: 'imagine',
  alias: ['imagen-ia', 'dibujar', 'dalle'],
  category: 'ia',
  description: 'Genera una imagen con IA a partir de un texto.',
  usage: 'imagine <descripción>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}imagine <descripción>\n» Ejemplo: ${prefix}imagine un gato astronauta en la luna`)

    try {
      const url = 'https://image.pollinations.ai/prompt/' +
        encodeURIComponent(text) + '?width=768&height=768&nologo=true'

      await sock.sendMessage(chatId, {
        image: { url },
        caption: `> 〄 *${text}*`
      }, { quoted: msg })
    } catch {
      await reply('» No pude generar la imagen. Intenta con otra descripción o más tarde.')
    }
  }
}
