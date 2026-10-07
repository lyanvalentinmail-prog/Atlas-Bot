// ╭────────────────────────────────────────────
// │  COMANDO » staff » equipo administrativo:
// │  dueño del bot + admins del grupo.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'
import { box, kv } from '../../lib/ui.js'

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

      await reply(box('STAFF', [
        kv('Dueño del bot', `*${config.ownerName}*`),
        kv('Admins del grupo', `${admins.length}`),
        '│─────────────',
        ...admins.slice(0, 15).map((jid, i) => `│ ${i + 1}. @${getNumber(jid)}`),
        ...(admins.length > 15 ? [`│ … y ${admins.length - 15} más`] : [])
      ]), { mentions: ownerJid ? [ownerJid, ...admins] : admins })
    } catch {
      await reply('» No pude leer el staff del grupo.')
    }
  }
}
