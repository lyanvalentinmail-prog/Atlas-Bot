// ╭────────────────────────────────────────────
// │  COMANDO » borrar » elimina el mensaje citado.
// ╰────────────────────────────────────────────
import { getContextInfo } from '../../lib/utils.js'

export default {
  name: 'delete',
  alias: ['del', 'borrar'],
  category: 'moderacion',
  description: 'Elimina un mensaje del grupo (respóndelo).',
  usage: 'delete (respondiendo a un mensaje)',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, reply, chatId }) => {
    const ctx = getContextInfo(msg)
    const stanzaId = ctx?.stanzaId
    if (!stanzaId) return reply('» Responde al mensaje que quieres borrar.')

    try {
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          id: stanzaId,
          participant: ctx.participant,
          fromMe: false
        }
      })
    } catch {
      await reply('» No pude borrar ese mensaje (¿soy admin?).')
    }
  }
}
