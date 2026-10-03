// ╭────────────────────────────────────────────
// │  COMANDO » ban » expulsa y veta del grupo.
// │  Si vuelve a entrar, el bot lo expulsa solo.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'ban',
  alias: ['vetar', 'banear'],
  category: 'moderacion',
  description: 'Expulsa y bloquea a un usuario del grupo.',
  usage: 'ban @usuario',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, reply, chatId, isOwner, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}ban @usuario (o respóndele)`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    if (!settings.banned.includes(number)) {
      settings.banned.push(number)
      saveDatabase()
    }

    try { await sock.groupParticipantsUpdate(chatId, [target], 'remove') } catch {}
    await reply(`> ⛔ @${number} fue *expulsado y vetado* del grupo.`, { mentions: [target] })
  }
}
