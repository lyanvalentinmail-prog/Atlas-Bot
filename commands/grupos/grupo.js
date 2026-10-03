// ╭────────────────────────────────────────────
// │  COMANDO » grupo
// │  Abre o cierra el grupo:
// │  !grupo abrir   -> todos pueden escribir
// │  !grupo cerrar  -> solo admins escriben
// ╰────────────────────────────────────────────

export default {
  name: 'grupo',
  alias: ['group'],
  category: 'grupos',
  description: 'Abre o cierra el grupo.',
  usage: 'grupo <abrir|cerrar>',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, args, prefix, reply }) => {
    const action = (args[0] || '').toLowerCase()
    const settings = {
      abrir: 'not_announcement',
      cerrar: 'announcement',
      open: 'not_announcement',
      close: 'announcement'
    }

    const setting = settings[action]
    if (!setting) {
      return reply(`» Uso correcto: ${prefix}grupo <abrir/cerrar>`)
    }

    await sock.groupSettingUpdate(chatId, setting)

    const closed = setting === 'announcement'
    await reply(
      closed
        ? '» Grupo cerrado. Solo los administradores pueden enviar mensajes.'
        : '» Grupo abierto. Todos los participantes pueden enviar mensajes.'
    )
  }
}
