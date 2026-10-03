// ╭────────────────────────────────────────────
// │  COMANDO » nuevolink
// │  Revoca el enlace actual del grupo y
// │  genera uno nuevo (el bot debe ser admin).
// ╰────────────────────────────────────────────

export default {
  name: 'nuevolink',
  alias: ['revocar', 'resetlink', 'reinvocar'],
  category: 'grupos',
  description: 'Genera un enlace nuevo del grupo.',
  usage: 'nuevolink',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      const codigo = await sock.groupRevokeInvite(chatId)
      await reply(`> こ Enlace renovado:\n> https://chat.whatsapp.com/${codigo}`)
    } catch {
      await reply('» No pude renovar el enlace.')
    }
  }
}
