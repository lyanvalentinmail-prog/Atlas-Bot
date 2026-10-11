// ╭────────────────────────────────────────────
// │  COMANDO » unmute » quita el silencio.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'unmute',
  alias: ['desmutear', 'hablar'],
  category: 'moderacion',
  description: 'Quita el silencio de un miembro.',
  usage: 'unmute @usuario',
  adminOnly: true,
  groupOnly: true,

  run: async ({ msg, reply, chatId, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}unmute @usuario (o respóndele)`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    settings.muted = settings.muted.filter(n => n !== number)
    saveDatabase()
    await reply(`> こ @${number} ya puede escribir de nuevo.`, { mentions: [target] })
  }
}
