// ╭────────────────────────────────────────────
// │  COMANDO » temporada » animes de temporada
// │  actual o de una específica (Jikan API).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

const TEMPORADAS = ['winter', 'spring', 'summer', 'fall']

export default {
  name: 'temporada',
  alias: ['season', 'animetemporada'],
  category: 'anime',
  description: 'Muestra animes de una temporada específica.',
  usage: 'temporada [año temporada] ・ temporada (actual)',

  run: async ({ reply, args, prefix }) => {
    const anio = Math.abs(parseInt(args[0], 10))
    const temp = (args[1] || '').toLowerCase()

    const url = (anio && TEMPORADAS.includes(temp))
      ? `https://api.jikan.moe/v4/seasons/${anio}/${temp}?sfw&limit=8`
      : 'https://api.jikan.moe/v4/seasons/now?sfw&limit=8'

    try {
      const data = await fetchJson(url)
      const lista = data?.data
      if (!lista?.length) return reply('» No encontré animes de esa temporada.')

      const lineas = lista.map((a, i) =>
        `${i + 1}. *${a.title}* ${a.score ? `(★${a.score})` : ''}`)
      await reply([`> Animes de temporada${anio ? ` ${anio}/${temp}` : ' (ahora)'}:`, ...lineas].join('\n'))
    } catch {
      await reply('» No pude leer la temporada ahora mismo.')
    }
  }
}
