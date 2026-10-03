// ╭────────────────────────────────────────────
// │  COMANDO » kick
// │  Expulsa a un miembro del grupo.
// │  !kick @usuario   o   responde a su mensaje con !kick
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber, isOwnerNumber } from '../../lib/utils.js'

export default {
  name: 'kick',
  alias: ['expulsar'],
  category: 'grupos',
  description: 'Expulsa a un miembro del grupo.',
  usage: 'kick @usuario',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, chatId, reply, config, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) {
      return reply(`${config.messages.noMention}\n» Uso: ${prefix}kick @usuario`)
    }

    const targetNumber = getNumber(target)

    if (isOwnerNumber(config, targetNumber)) {
      return reply('» No puedo expulsar al dueño del bot.')
    }
    if (targetNumber === getNumber(sock.user?.id)) {
      return reply('» No puedo expulsarme a mí mismo.')
    }

    const response = await sock.groupParticipantsUpdate(chatId, [target], 'remove')

    if (response?.[0]?.status === '200') {
      await reply(`» @${targetNumber} fue expulsado del grupo.`, { mentions: [target] })
    } else {
      await reply('» No se pudo expulsar al usuario. Verifica que esté en el grupo.')
    }
  }
}
