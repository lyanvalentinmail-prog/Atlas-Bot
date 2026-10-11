// ╭────────────────────────────────────────────
// │  COMANDO » setdesc
// │  Cambia la descripción del grupo
// │  (solo admins; el bot debe ser admin).
// ╰────────────────────────────────────────────

export default {
  name: 'setdesc',
  alias: ['descripcion', 'cambiardesc'],
  category: 'grupos',
  description: 'Cambia la descripción del grupo.',
  usage: 'setdesc <texto>',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}setdesc <nueva descripción>`)

    try {
      await sock.groupUpdateDescription(chatId, text)
      await reply('> こ Descripción del grupo actualizada.')
    } catch {
      await reply('» No pude cambiar la descripción.')
    }
  }
}
