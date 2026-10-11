// ╭────────────────────────────────────────────
// │  COMANDO » antispam » anti repeticiones.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'antispam',
  alias: ['spamfilter'],
  category: 'moderacion',
  description: 'Activa o desactiva la protección contra spam.',
  usage: 'antispam on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'on' || opcion === 'off') {
      settings.antispam = opcion === 'on'
      saveDatabase()
      return reply(`> こ Anti-spam *${settings.antispam ? 'activado' : 'desactivado'}*.`)
    }
    await reply(`» Estado: ${settings.antispam ? '*activado*' : '*desactivado*'}\n» Uso: ${prefix}antispam on/off`)
  }
}
