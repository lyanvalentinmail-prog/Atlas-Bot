// ╭────────────────────────────────────────────
// │  COMANDO » listmembers » todos los miembros
// │  del grupo, numerados, admins marcados.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'
import { box, hint } from '../../lib/ui.js'

export default {
  name: 'listmembers',
  alias: ['miembros', 'listamiembros'],
  category: 'administracion',
  description: 'Muestra los miembros del grupo.',
  usage: 'listmembers',
  groupOnly: true,

  run: async ({ sock, chatId, reply }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const miembros = metadata.participants
      const totalAdmins = miembros.filter(isAdmin).length

      const lineas = miembros.slice(0, 60).map((p, i) =>
        `│ ${i + 1}. @${getNumber(p.id)}${isAdmin(p) ? ' › *admin*' : ''}`)

      await reply(box(`MIEMBROS ・ ${miembros.length}`, [
        ...lineas,
        ...(miembros.length > 60 ? [`│ … y ${miembros.length - 60} más`] : [])
      ], hint(`Admins: ${totalAdmins} ・ miembros: ${miembros.length - totalAdmins}`)),
        { mentions: miembros.slice(0, 60).map(p => p.id) })
    } catch {
      await reply('» No pude leer la lista de miembros.')
    }
  }
}
