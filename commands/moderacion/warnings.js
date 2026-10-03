// ╭────────────────────────────────────────────
// │  COMANDO » warnings » ver advertencias.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings } from '../../lib/database.js'
import { WARN_LIMIT } from './warn.js'

export default {
  name: 'warnings',
  alias: ['warns', 'advertencias'],
  category: 'moderacion',
  description: 'Muestra las advertencias de un usuario.',
  usage: 'warnings [@usuario]',
  groupOnly: true,

  run: async ({ msg, reply, chatId, sender }) => {
    const target = getTargetUser(msg) || sender
    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    const cuenta = settings.warns[number] || 0

    await reply(`> 〔⚠〕 @${number} tiene *${cuenta}/${WARN_LIMIT}* advertencias.`, { mentions: [target] })
  }
}
