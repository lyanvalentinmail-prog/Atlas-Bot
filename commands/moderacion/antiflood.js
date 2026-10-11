// ╭────────────────────────────────────────────
// │  COMANDO » antiflood » anti ráfagas.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'antiflood',
  alias: ['floodfilter'],
  category: 'moderacion',
  description: 'Detecta mensajes enviados masivamente.',
  usage: 'antiflood on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'on' || opcion === 'off') {
      settings.antiflood = opcion === 'on'
      saveDatabase()
      return reply(`> こ Anti-flood *${settings.antiflood ? 'activado' : 'desactivado'}*.`)
    }
    await reply(`» Estado: ${settings.antiflood ? '*activado*' : '*desactivado*'}\n» Uso: ${prefix}antiflood on/off`)
  }
}
