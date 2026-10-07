// ╭────────────────────────────────────────────
// │  COMANDO » pelicula » busca película
// │  (sugerencias públicas de IMDb).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'movie',
  alias: ['peli', 'pelicula'],
  category: 'busqueda',
  description: 'Busca información sobre una película.',
  usage: 'movie <título>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}movie <título>`)

    try {
      const letra = (text[0] || 'a').toLowerCase()
      const data = await fetchJson(
        `https://v3.sg.media-imdb.com/suggestion/${letra}/${encodeURIComponent(text)}.json?includeVideos=0`
      )

      const peliculas = (data?.d || []).filter(item => item.qid === 'movie')
      if (peliculas.length === 0) return reply(`» No encontré la película *${text}*.`)

      const p = peliculas[0]
      const reparto = (p.s || '').slice(0, 150)

      await reply([
        '╭─「 PELÍCULA 」',
        `│ » Título : ${p.l}${p.y ? ` (${p.y})` : ''}`,
        `│ » Tipo   : película`,
        `│ » Reparto: ${reparto || '—'}`,
        '╰─────────────',
        `> IMDb » https://www.imdb.com/title/${p.id}/`
      ].join('\n'))
    } catch {
      await reply(`» No encontré la película *${text}*.`)
    }
  }
}
