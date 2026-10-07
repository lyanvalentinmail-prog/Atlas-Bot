// ╭────────────────────────────────────────────
// │  COMANDO » listadmins » lista los admins
// │  con mención y conteo.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'
import { box, hint } from '../../lib/ui.js'

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
      const creador = metadata.owner || null

      const lineas = admins.map((jid, i) =>
        `│ ${i + 1}. @${getNumber(jid)}${creador && jid === creador ? ' › creador' : ''}`)

      await reply(box(`ADMINS DEL GRUPO ・ ${admins.length}`, lineas,
        hint(`${metadata.participants.length} miembros en total`)),
        { mentions: admins })
    } catch {
      await reply('» No pude leer la lista de administradores.')
    }
  }
}
