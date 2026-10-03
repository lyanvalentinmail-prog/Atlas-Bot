// ╭────────────────────────────────────────────
// │  COMANDO » listmembers » todos los miembros.
// ╰────────────────────────────────────────────
import { getNumber, isAdmin } from '../../lib/utils.js'

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

      const lineas = miembros.slice(0, 60).map((p, i) =>
        `${i + 1}. @${getNumber(p.id)}${isAdmin(p) ? ' ᚛ admin' : ''}`)

      await reply([
        `╭─「 MIEMBROS ・ ${miembros.length} 」`,
        ...lineas,
        miembros.length > 60 ? `… y ${miembros.length - 60} más` : '╰─────────────'
      ].filter(Boolean).join('\n'), { mentions: miembros.slice(0, 60).map(p => p.id) })
    } catch {
      await reply('» No pude leer la lista de miembros.')
    }
  }
}
