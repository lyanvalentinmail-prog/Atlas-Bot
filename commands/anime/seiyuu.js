// ╭────────────────────────────────────────────
// │  COMANDO » seiyuu » actor/actriz de voz (Jikan).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'seiyuu',
  alias: ['voz', 'actorvoz'],
  category: 'anime',
  description: 'Busca información sobre un actor de voz japonés.',
  usage: 'seiyuu <nombre>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}seiyuu <nombre>`)

    try {
      const data = await fetchJson(`https://api.jikan.moe/v4/people?q=${encodeURIComponent(text)}&limit=1&sfw`)
      const persona = data?.data?.[0]
      if (!persona) return reply(`» No encontré a *${text}*.`)

      const sobre = (persona.about || 'Sin información.')
      const caption = [
        '╭─「 SEIYUU 」',
        `│ » Nombre     : ${persona.name}`,
        `│ » Favoritos  : ${(persona.favorites || 0).toLocaleString('es')}`,
        '╰─────────────',
        `> ${sobre.length > 350 ? sobre.slice(0, 350).trimEnd() + '...' : sobre}`
      ].join('\n')

      const imagen = persona.images?.jpg?.image_url
      if (imagen) {
        await sock.sendMessage(chatId, { image: { url: imagen }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply('» No se pudo buscar al actor de voz ahora mismo.')
    }
  }
}
