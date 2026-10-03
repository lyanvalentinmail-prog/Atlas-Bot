// ╭────────────────────────────────────────────
// │  COMANDO » qr
// │  Genera un código QR del texto indicado
// │  (api.qrserver.com, servicio gratuito).
// ╰────────────────────────────────────────────

export default {
  name: 'qr',
  alias: ['qrcode', 'codigoqr'],
  category: 'herramientas',
  description: 'Genera un código QR de un texto.',
  usage: 'qr <texto>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}qr <texto>\n» Ejemplo: ${prefix}qr https://google.com`)

    try {
      const url = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' +
        encodeURIComponent(text)

      await sock.sendMessage(chatId, {
        image: { url },
        caption: '> こ Código QR listo.'
      }, { quoted: msg })
    } catch {
      await reply('» No pude generar el código QR. Intenta más tarde.')
    }
  }
}
