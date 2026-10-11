// ╭────────────────────────────────────────────
// │  COMANDO » unban » retira el veto.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'unban',
  alias: ['desvetar', 'desbanear'],
  category: 'moderacion',
  description: 'Retira el bloqueo de un usuario.',
  usage: 'unban @usuario',
  adminOnly: true,
  groupOnly: true,

  run: async ({ msg, reply, chatId, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}unban @usuario`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    settings.banned = settings.banned.filter(n => n !== number)
    saveDatabase()
    await reply(`> こ @${number} ya no está vetado. Puede volver al grupo.`, { mentions: [target] })
  }
}
