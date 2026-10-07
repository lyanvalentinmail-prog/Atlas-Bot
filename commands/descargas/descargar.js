// ╭────────────────────────────────────────────
// │  COMANDO » descargar (PLANTILLA)
// │  Las descargas (TikTok, YouTube, Instagram...)
// │  necesitan un servicio externo. Este comando
// │  es la plantilla: conecta aquí tu API favorita.
// │
// │  EJEMPLO de implementación (guardar como video):
// │
// │  const data = await fetchJson(`https://tu-api.com/dl?url=${url}`)
// │  await sock.sendMessage(chatId, {
// │    video: { url: data.result.url },
// │    caption: '> Aquí tienes tu video.',
// │    mimetype: 'video/mp4'
// │  }, { quoted: msg })
// │
// │  Para audio: { audio: { url }, mimetype: 'audio/mpeg' }
// ╰────────────────────────────────────────────

export default {
  name: 'download',
  alias: ['dl', 'descargar'],
  category: 'descargas',
  description: 'Descarga videos y música (conecta tu API).',
  usage: 'download <url>',

  run: async ({ reply, args, prefix }) => {
    if (!args[0]) return reply(`» Uso: ${prefix}download <url>`)

    await reply(
      '> Las descargas aún no están configuradas.\n' +
      '> Conecta tu API en *commands/descargas/descargar.js*\n' +
      '> (el archivo incluye un ejemplo comentado).'
    )
  }
}
