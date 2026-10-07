// ╭────────────────────────────────────────────
// │  COMANDO » promoteall » admin para todos
// │  (menos el bot y el dueño del bot).
// ╰────────────────────────────────────────────
import { isAdmin, getNumber, sleep } from '../../lib/utils.js'

export default {
  name: 'promoteall',
  alias: ['admintodos'],
  category: 'administracion',
  description: 'Promueve a admin a todos los participantes.',
  usage: 'promoteall',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply, config }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const objetivos = metadata.participants
        .filter(p => !isAdmin(p))
        .map(p => p.id)
        .filter(jid => !config.ownerNumbers.includes(getNumber(jid)))

      if (objetivos.length === 0) return reply('» Ya son todos administradores.')

      await reply(`> Ascendiendo a ${objetivos.length} miembros... un momento.`)
      // De a tandas para no saturar a WhatsApp
      for (let i = 0; i < objetivos.length; i += 5) {
        try { await sock.groupParticipantsUpdate(chatId, objetivos.slice(i, i + 5), 'promote') } catch {}
        await sleep(1500)
      }
      await reply('> こ Listo: todos los miembros ahora son administradores.')
    } catch {
      await reply('» No pude promover a todos.')
    }
  }
}
