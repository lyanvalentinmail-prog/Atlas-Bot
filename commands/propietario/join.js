// ╭────────────────────────────────────────────
// │  COMANDO » join (solo dueño)
// │  El bot se une a un grupo con su enlace.
// │  !join https://chat.whatsapp.com/CODIGO
// ╰────────────────────────────────────────────

export default {
  name: 'join',
  alias: ['unirse', 'entrar'],
  category: 'propietario',
  description: 'El bot se une a un grupo mediante su enlace.',
  usage: 'join <enlace del grupo>',
  ownerOnly: true,

  run: async ({ sock, args, prefix, reply }) => {
    const match = (args[0] || '').match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]+)/)
    if (!match) {
      return reply(`» Uso correcto: ${prefix}join <enlace del grupo>`)
    }

    await sock.groupAcceptInvite(match[1])
    await reply('» Me uní al grupo correctamente.')
  }
}
