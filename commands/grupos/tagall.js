// ╭────────────────────────────────────────────
// │  COMANDO » tagall
// │  Menciona a todos los miembros del grupo.
// │  !tagall [mensaje opcional]
// ╰────────────────────────────────────────────
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'tagall',
  alias: ['todos', 'mentionall'],
  category: 'grupos',
  description: 'Menciona a todos los miembros del grupo.',
  usage: 'tagall [mensaje]',
  groupOnly: true,
  adminOnly: true,

  run: async ({ sock, msg, chatId, groupMetadata, text }) => {
    const participants = groupMetadata?.participants || []

    // Se prefiere el JID de teléfono si existe (por los IDs LID)
    const mentions = participants.map(p => p.phoneNumber || p.id)

    const lines = [
      '╭─「 AVISO GENERAL 」',
      `│ » ${text || 'Atención a todos los miembros'}`,
      '│─────────────',
      ...participants.map(p => `│ » @${getNumber(p.phoneNumber || p.id)}`),
      '╰─────────────'
    ]

    await sock.sendMessage(chatId, {
      text: lines.join('\n'),
      mentions
    }, { quoted: msg })
  }
}
