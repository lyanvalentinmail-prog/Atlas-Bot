// ╭────────────────────────────────────────────
// │  COMANDO » silenciar » cierra el chat para
// │  todos menos los admins (con minutos opcional).
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'silenciar',
  alias: ['mutechat', 'silencio'],
  category: 'moderacion',
  description: 'Silencia el chat temporalmente.',
  usage: 'silenciar [minutos]',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const settings = getGroupSettings(chatId)
    const minutos = Math.abs(parseInt(args[0], 10))

    if (minutos && minutos > 0) {
      settings.mutedChat = Date.now() + minutos * 60 * 1000
      saveDatabase()
      return reply(`> 。。Chat *silenciado por ${minutos} minuto(s)*. Solo escriben los admins.`)
    }

    settings.mutedChat = -1
    saveDatabase()
    await reply(`> 。。Chat *silenciado indefinidamente*. Solo escriben los admins.\n> Reactiva con ${prefix}desilenciar`)
  }
}
