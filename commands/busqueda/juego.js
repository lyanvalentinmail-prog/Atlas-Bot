// ╭────────────────────────────────────────────
// │  COMANDO » juego » busca videojuego
// │  (CheapShark, API pública sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'juego',
  alias: ['game', 'videojuego'],
  category: 'busqueda',
  description: 'Busca información sobre un videojuego.',
  usage: 'juego <título>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}juego <título>`)

    try {
      const data = await fetchJson(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(text)}&limit=3&exact=0`)
      if (!data?.length) return reply(`» No encontré el juego *${text}*.`)

      const lineas = data.map(j =>
        `・ *${j.external}*\n> Steam: ${j.steamRatingText || '—'} ・ Precio ref: $${j.cheapest}`)
      await reply([`> Videojuegos parecidos a *${text}*:`, ...lineas].join('\n\n'))
    } catch {
      await reply(`» No encontré el juego *${text}*.`)
    }
  }
}
