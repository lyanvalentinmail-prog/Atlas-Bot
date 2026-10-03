// ╭────────────────────────────────────────────
// │  COMANDO » demote
// │  Quita el administrador a un miembro.
// │  !demote @usuario  o  responde a su mensaje
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'demote',
  alias: ['quitaradmin'],
  category: 'grupos',
  description: 'Quita el administrador a un miembro del grupo.',
  usage: 'demote @usuario',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, chatId, reply, config, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) {
      return reply(`${config.messages.noMention}\n» Uso: ${prefix}demote @usuario`)
    }

    const response = await sock.groupParticipantsUpdate(chatId, [target], 'demote')

    if (response?.[0]?.status === '200') {
      await reply(`» @${getNumber(target)} ya no es administrador del grupo.`, { mentions: [target] })
    } else {
      await reply('» No se pudo quitar el administrador. Verifica que esté en el grupo.')
    }
  }
}
