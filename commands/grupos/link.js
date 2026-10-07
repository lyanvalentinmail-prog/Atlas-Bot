// ╭────────────────────────────────────────────
// │  COMANDO » link
// │  Muestra el enlace de invitación del grupo.
// ╰────────────────────────────────────────────

export default {
  name: 'link',
  alias: ['enlace', 'invitar'],
  category: 'grupos',
  description: 'Muestra el enlace de invitación del grupo.',
  usage: 'link',
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply }) => {
    const code = await sock.groupInviteCode(chatId)
    await reply([
      '╭─「 ENLACE DEL GRUPO 」',
      '╰─────────────',
      `https://chat.whatsapp.com/${code}`,
      '',
      `> Compártelo con quien quieras sumar al grupo.`
    ].join('\n'))
  }
}
