// ╭────────────────────────────────────────────
// │  COMANDO » nuevolink
// │  Revoca el enlace actual del grupo y
// │  genera uno nuevo (el bot debe ser admin).
// ╰────────────────────────────────────────────

export default {
  name: 'newlink',
  alias: ['revocar', 'resetlink', 'reinvocar', 'nuevolink'],
  category: 'grupos',
  description: 'Genera un enlace nuevo del grupo.',
  usage: 'newlink',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      const codigo = await sock.groupRevokeInvite(chatId)
      await reply([
        '╭─「 ENLACE RENOVADO 」',
        '╰─────────────',
        `https://chat.whatsapp.com/${codigo}`,
        '',
        '> こ El enlace anterior quedó revocado.'
      ].join('\n'))
    } catch {
      await reply('» No pude renovar el enlace.')
    }
  }
}
