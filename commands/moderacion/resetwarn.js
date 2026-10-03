// ╭────────────────────────────────────────────
// │  COMANDO » resetwarn » limpia advertencias.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'resetwarn',
  alias: ['limpiarwarn', 'warn0'],
  category: 'moderacion',
  description: 'Reinicia todas las advertencias de un usuario.',
  usage: 'resetwarn @usuario',
  adminOnly: true,
  groupOnly: true,

  run: async ({ msg, reply, chatId, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}resetwarn @usuario`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    delete settings.warns[number]
    saveDatabase()
    await reply(`> こ Advertencias de @${number} reiniciadas a 0.`, { mentions: [target] })
  }
}
