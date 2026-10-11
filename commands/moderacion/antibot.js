// ╭────────────────────────────────────────────
// │  COMANDO » antibot » detecta cuentas con
// │  actividad de bot al entrar al grupo.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'antibot',
  alias: ['botsfilter'],
  category: 'moderacion',
  description: 'Detecta bots no autorizados en el grupo.',
  usage: 'antibot on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'on' || opcion === 'off') {
      settings.antibot = opcion === 'on'
      saveDatabase()
      return reply(`> こ Anti-bot *${settings.antibot ? 'activado' : 'desactivado'}*.`)
    }
    await reply(`» Estado: ${settings.antibot ? '*activado*' : '*desactivado*'}\n» Uso: ${prefix}antibot on/off`)
  }
}
