// ╭────────────────────────────────────────────
// │  COMANDO » randommanga » manga al azar SOLO
// │  apto para todos (sans hentai/ecchi).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

const esSeguro = (item) => {
  if (!item) return false
  const generos = (item.genres || []).map(g => (g.name || '').toLowerCase())
  return !generos.some(g => ['hentai', 'erotica', 'ecchi'].includes(g))
}

export default {
  name: 'randommanga',
  alias: ['mangarec', 'aleatoriomang'],
  category: 'anime',
  description: 'Recomienda un manga aleatorio (apto para todos).',
  usage: 'randommanga',

  run: async ({ reply }) => {
    try {
      let manga = null
      for (let i = 0; i < 4 && !esSeguro(manga); i++) {
        const data = await fetchJson('https://api.jikan.moe/v4/random/manga?sfw')
        manga = data?.data
      }
      if (!esSeguro(manga)) return reply('» No encontré un manga apto ahora; prueba otra vez.')

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
