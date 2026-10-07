// ╭────────────────────────────────────────────
// │  COMANDO » randomanime » recomendación al
// │  azar SOLO apta para todos (sin R17/Rx).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

const esSeguro = (item) => {
  if (!item) return false
  const rating = (item.rating || '').toLowerCase()
  if (rating.startsWith('rx') || rating.includes('hentai') || rating.includes('erot')) return false
  const generos = (item.genres || []).map(g => (g.name || '').toLowerCase())
  return !generos.some(g => ['hentai', 'erotica', 'ecchi'].includes(g))
}

export default {
  name: 'randomanime',
  alias: ['animerec', 'aleatorioanime'],
  category: 'anime',
  description: 'Recomienda un anime aleatorio (apto para todos).',
  usage: 'randomanime',

  run: async ({ sock, msg, chatId, reply }) => {
    try {
      let anime = null
      for (let i = 0; i < 4 && !esSeguro(anime); i++) {
        const data = await fetchJson('https://api.jikan.moe/v4/random/anime?sfw')
        anime = data?.data
      }
      if (!esSeguro(anime)) return reply('» No encontré un anime apto ahora; prueba otra vez.')

      const sinopsis = (anime.synopsis || 'Sin descripción.')
      const caption = [
        '╭─「 ANIME AL AZAR 」',
        `│ » *${anime.title}*`,
        `│ » Tipo    : ${anime.type || '—'} ${anime.episodes ? `・ ${anime.episodes} eps` : ''}`,
        `│ » Puntaje : ${anime.score ?? '—'}/10`,
        `│ » Rating  : ${anime.rating || '—'}`,
        '╰─────────────',
        `> ${sinopsis.length > 280 ? sinopsis.slice(0, 280).trimEnd() + '...' : sinopsis}`
      ].join('\n')

      const imagen = anime.images?.jpg?.image_url
      if (imagen) {
        await sock.sendMessage(chatId, { image: { url: imagen }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply('» No pude recomendarte nada ahora mismo.')
    }
  }
}
