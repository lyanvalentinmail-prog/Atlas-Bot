// ╭────────────────────────────────────────────
// │  COMANDO » randommanga » manga al azar.
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'randommanga',
  alias: ['mangarec', 'aleatoriomang'],
  category: 'anime',
  description: 'Recomienda un manga aleatorio.',
  usage: 'randommanga',

  run: async ({ reply }) => {
    try {
      const data = await fetchJson('https://api.jikan.moe/v4/random/manga')
      const manga = data?.data
      if (!manga) return reply('» No pude sacar un manga aleatorio.')

      const sinopsis = (manga.synopsis || 'Sin descripción.')
      await reply([
        '╭─「 MANGA AL AZAR 」',
        `│ » *${manga.title}*`,
        `│ » Capítulos: ${manga.chapters ?? '?'} ・ ${manga.status || '—'}`,
        `│ » Puntaje  : ${manga.score ?? '—'}/10`,
        '╰─────────────',
        `> ${sinopsis.length > 280 ? sinopsis.slice(0, 280).trimEnd() + '...' : sinopsis}`
      ].join('\n'))
    } catch {
      await reply('» No pude recomendarte nada ahora mismo.')
    }
  }
}
