// ╭────────────────────────────────────────────
// │  COMANDO » unblock » desbloquea a un usuario.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'unblock',
  alias: ['desbloquear'],
  category: 'propietario',
  description: 'Desbloquea a un usuario.',
  usage: 'unblock @usuario',
  ownerOnly: true,

  run: async ({ sock, msg, chatId, reply, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}unblock @usuario (o respóndele)`)

    try {
      await sock.updateBlockStatus(target, 'unblock')
      await reply(`> こ @${getNumber(target)} desbloqueado.`, { mentions: [target] })
    } catch {
      await reply('» No pude desbloquearlo.')
    }
  }
}
