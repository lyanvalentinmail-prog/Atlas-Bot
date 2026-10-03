// ╭────────────────────────────────────────────
// │  COMANDO » demoteall » quita admin a todos
// │  (menos el bot y el dueño del bot).
// ╰────────────────────────────────────────────
import { isAdmin, getNumber, sleep } from '../../lib/utils.js'

export default {
  name: 'demoteall',
  alias: ['noadmintodos'],
  category: 'administracion',
  description: 'Quita permisos administrativos seleccionados.',
  usage: 'demoteall',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply, config }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const objetivos = metadata.participants
        .filter(p => isAdmin(p))
        .map(p => p.id)
        .filter(jid => !config.ownerNumbers.includes(getNumber(jid))
          && !jid.startsWith(getNumber(sock.user?.id || 'nada')))

      if (objetivos.length === 0) return reply('» No hay administradores que degradar.')

      await reply(`> Degradando a ${objetivos.length} admins... un momento.`)
      for (let i = 0; i < objetivos.length; i += 5) {
        try { await sock.groupParticipantsUpdate(chatId, objetivos.slice(i, i + 5), 'demote') } catch {}
        await sleep(1500)
      }
      await reply('> こ Listo: miembros degradados a participantes.')
    } catch {
      await reply('» No pude degradar a todos.')
    }
  }
}
