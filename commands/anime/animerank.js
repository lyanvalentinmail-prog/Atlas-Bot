// ╭────────────────────────────────────────────
// │  COMANDO » animerank » top anime (Jikan).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'animerank',
  alias: ['topanime', 'rankanime'],
  category: 'anime',
  description: 'Muestra información de popularidad de animes.',
  usage: 'animerank',

  run: async ({ reply }) => {
    try {
      const data = await fetchJson('https://api.jikan.moe/v4/top/anime?limit=10')
      const lista = data?.data
      if (!lista?.length) return reply('» No pude leer el ranking ahora.')

      const lineas = lista.map((a, i) => `${i + 1}. *${a.title_english || a.title}* ★${a.score ?? '—'}`)
      await reply(['╭─「 TOP 10 ANIME 」', ...lineas, '╰─────────────'].join('\n'))
    } catch {
      await reply('» No pude leer el ranking ahora mismo.')
    }
  }
}
