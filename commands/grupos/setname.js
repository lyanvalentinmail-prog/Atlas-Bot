// ╭────────────────────────────────────────────
// │  COMANDO » setname
// │  Cambia el nombre del grupo
// │  (solo admins; el bot debe ser admin).
// ╰────────────────────────────────────────────

export default {
  name: 'setname',
  alias: ['nombregrupo', 'cambiarnombre'],
  category: 'grupos',
  description: 'Cambia el nombre del grupo.',
  usage: 'setname <texto>',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}setname <nuevo nombre>`)
    if (text.length > 100) return reply('» El nombre es demasiado largo (máx. 100 caracteres).')

    try {
      await sock.groupUpdateSubject(chatId, text)
      await reply('> こ Nombre del grupo actualizado.')
    } catch {
      await reply('» No pude cambiar el nombre.')
    }
  }
}
