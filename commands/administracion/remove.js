// ╭────────────────────────────────────────────
// │  COMANDO » remove » quita un participante.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'remove',
  alias: ['quitar', 'sacar'],
  category: 'administracion',
  description: 'Elimina un participante del grupo.',
  usage: 'remove @usuario',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, chatId, reply, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}remove @usuario (o respóndele)`)

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'remove')
      await reply(`> こ @${getNumber(target)} fue eliminado del grupo.`, { mentions: [target] })
    } catch {
      await reply('» No pude eliminarlo (¿soy admin?).')
    }
  }
}
