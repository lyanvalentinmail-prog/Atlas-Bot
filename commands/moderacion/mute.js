// ╭────────────────────────────────────────────
// │  COMANDO » mute » silencia a un miembro:
// │  el bot borra todo lo que escriba.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'mute',
  alias: ['callar', 'mutear'],
  category: 'moderacion',
  description: 'Silencia temporalmente a un miembro del grupo.',
  usage: 'mute @usuario',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ msg, reply, chatId, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}mute @usuario (o respóndele)`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    if (!settings.muted.includes(number)) {
      settings.muted.push(number)
      saveDatabase()
    }
    await reply(`> こ @${number} quedó *silenciado*. Borraré sus mensajes.`, { mentions: [target] })
  }
}
