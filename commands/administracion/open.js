// ╭────────────────────────────────────────────
// │  COMANDO » open » abre el grupo.
// ╰────────────────────────────────────────────

export default {
  name: 'open',
  alias: ['abrir', 'abrirgrupo'],
  category: 'administracion',
  description: 'Abre el grupo para todos los participantes.',
  usage: 'open',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement')
      await reply('> こ Grupo *abierto*: todos pueden escribir.')
    } catch {
      await reply('» No pude abrir el grupo.')
    }
  }
}
