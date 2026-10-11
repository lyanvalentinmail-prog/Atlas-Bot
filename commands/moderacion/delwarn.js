// ╭────────────────────────────────────────────
// │  COMANDO » delwarn » resta una advertencia.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'delwarn',
  alias: ['quitarwarn', 'borrarwarn'],
  category: 'moderacion',
  description: 'Elimina una advertencia de un usuario.',
  usage: 'delwarn @usuario',
  adminOnly: true,
  groupOnly: true,

  run: async ({ msg, reply, chatId, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}delwarn @usuario`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    settings.warns[number] = Math.max(0, (settings.warns[number] || 0) - 1)
    saveDatabase()
    await reply(`> こ Resté una advertencia a @${number}. Queda en ${settings.warns[number]}.`, { mentions: [target] })
  }
}
