// ╭────────────────────────────────────────────
// │  COMANDO » pareja
// │  Elige a dos miembros al azar del grupo
// │  y los empareja (diversión).
// ╰────────────────────────────────────────────
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'couple',
  alias: ['ship2', 'shippeo', 'pareja'],
  category: 'juegos',
  description: 'Forma una pareja al azar entre los miembros.',
  usage: 'couple',
  groupOnly: true,

  run: async ({ sock, msg, chatId, reply }) => {
    try {
      const metadata = await sock.groupMetadata(chatId)
      const miembros = metadata.participants.map(p => p.id)

      if (miembros.length < 2) return reply('» Hacen falta al menos 2 miembros.')

      let [a, b] = miembros
      while (b === a) {
        a = miembros[Math.floor(Math.random() * miembros.length)]
        b = miembros[Math.floor(Math.random() * miembros.length)]
      }

      await reply([
        '> ✿ LA PAREJA DEL DÍA',
        `> @${getNumber(a)}  ♥  @${getNumber(b)}`,
        '> ¿Se atreven a saludarse?'
      ].join('\n'), { mentions: [a, b] })
    } catch {
      await reply('» No pude elegir la pareja.')
    }
  }
}
