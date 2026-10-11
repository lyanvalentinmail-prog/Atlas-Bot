// ╭────────────────────────────────────────────
// │  COMANDO » promote
// │  Convierte a un miembro en administrador.
// │  !promote @usuario  o  responde a su mensaje
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'promote',
  alias: ['daradmin', 'admin'],
  category: 'grupos',
  description: 'Da administrador a un miembro del grupo.',
  usage: 'promote @usuario',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, chatId, reply, config, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) {
      return reply(`${config.messages.noMention}\n» Uso: ${prefix}promote @usuario`)
    }

    const response = await sock.groupParticipantsUpdate(chatId, [target], 'promote')

    if (response?.[0]?.status === '200') {
      await reply(`» @${getNumber(target)} ahora es administrador del grupo.`, { mentions: [target] })
    } else {
      await reply('» No se pudo dar administrador. Verifica que esté en el grupo.')
    }
  }
}
