// ╭────────────────────────────────────────────
// │  COMANDO » close » cierra el grupo.
// ╰────────────────────────────────────────────

export default {
  name: 'close',
  alias: ['cerrar', 'cerrargrupo'],
  category: 'administracion',
  description: 'Cierra el grupo para los participantes.',
  usage: 'close',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      await sock.groupSettingUpdate(chatId, 'announcement')
      await reply('> こ Grupo *cerrado*: solo escriben los admins.')
    } catch {
      await reply('» No pude cerrar el grupo.')
    }
  }
}
