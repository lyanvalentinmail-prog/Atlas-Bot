// ╭────────────────────────────────────────────
// │  COMANDO » listadmins » lista los admins.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'

export default {
  name: 'listadmins',
  alias: ['admins', 'listaadmins'],
  category: 'moderacion',
  description: 'Muestra la lista de administradores.',
  usage: 'listadmins',
  groupOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const admins = metadata.participants.filter(p => isAdmin(p)).map(p => p.id)
      const lineas = admins.map((jid, i) => `${i + 1}. @${getNumber(jid)}`)

      await reply([
        '╭─「 ADMINS DEL GRUPO 」',
        ...lineas,
        '╰─────────────'
      ].join('\n'), { mentions: admins })
    } catch {
      await reply('» No pude leer la lista de administradores.')
    }
  }
}
