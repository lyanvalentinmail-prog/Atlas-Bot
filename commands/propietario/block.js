// ╭────────────────────────────────────────────
// │  COMANDO » block » bloquea a un usuario
// │  en WhatsApp (a nivel cuenta).
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'block',
  alias: ['bloquear'],
  category: 'propietario',
  description: 'Bloquea a un usuario.',
  usage: 'block @usuario',
  ownerOnly: true,

  run: async ({ sock, msg, chatId, reply, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}block @usuario (o respóndele)`)

    try {
      await sock.updateBlockStatus(target, 'block')
      await reply(`> ⛔ @${getNumber(target)} bloqueado.`, { mentions: [target] })
    } catch {
      await reply('» No pude bloquearlo.')
    }
  }
}
