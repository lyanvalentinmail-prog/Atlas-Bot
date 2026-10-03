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
    await reply(`» Enlace del grupo:\nhttps://chat.whatsapp.com/${code}`)
  }
}
