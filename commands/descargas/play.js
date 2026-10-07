// ╭────────────────────────────────────────────
// │  COMANDO » play (PLANTILLA)
// │  Buscar y descargar música requiere una API
// │  externa. Conecta aquí la tuya (igual que en
// │  descargar.js, que incluye el ejemplo).
// ╰────────────────────────────────────────────

export default {
  name: 'play',
  alias: ['musica', 'song', 'ytmp3'],
  category: 'descargas',
  description: 'Busca y descarga música (conecta tu API).',
  usage: 'play <canción>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}play <nombre de la canción>`)

    await reply(
      '> La descarga de música aún no está configurada.\n' +
      '> Conecta tu API en *commands/descargas/play.js*\n' +
      '> siguiendo el ejemplo comentado de *descargar.js*.'
    )
  }
}
