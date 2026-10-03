// ╭────────────────────────────────────────────
// │  COMANDO » desilenciar » reactiva el chat.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'unmuteall',
  alias: ['unmutechat', 'hablartodos', 'desilenciar'],
  category: 'moderacion',
  description: 'Reactiva el chat después de silenciarlo.',
  usage: 'unmuteall',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId }) => {
    const settings = getGroupSettings(chatId)
    settings.mutedChat = 0
    saveDatabase()
    await reply('> こ Chat *reactivado*. Todos pueden escribir de nuevo.')
  }
}
