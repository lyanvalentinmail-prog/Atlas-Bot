// ╭────────────────────────────────────────────
// │  COMANDO » staff » equipo administrativo:
// │  dueño del bot + admins del grupo.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'

export default {
  name: 'staff',
  alias: ['equipo', 'staffgrupo'],
  category: 'moderacion',
  description: 'Muestra información del equipo administrativo.',
  usage: 'staff',
  groupOnly: true,

  run: async ({ sock, chatId, reply, config }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const admins = metadata.participants.filter(p => isAdmin(p)).map(p => p.id)
      const ownerJid = config.ownerNumbers[0] ? `${config.ownerNumbers[0]}@s.whatsapp.net` : null

      await reply([
        '╭─「 STAFF 」',
        `│ » Dueño del bot: ${config.ownerName}`,
        `│ » Admins del grupo: ${admins.length}`,
        '╰─────────────',
        ...admins.slice(0, 15).map((jid, i) => `${i + 1}. @${getNumber(jid)}`)
      ].join('\n'), { mentions: ownerJid ? [ownerJid, ...admins] : admins })
    } catch {
      await reply('» No pude leer el staff del grupo.')
    }
  }
}
