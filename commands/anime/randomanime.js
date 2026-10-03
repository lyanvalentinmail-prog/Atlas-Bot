// ╭────────────────────────────────────────────
// │  COMANDO » randomanime » recomendación al azar.
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'randomanime',
  alias: ['animerec', 'aleatorioanime'],
  category: 'anime',
  description: 'Recomienda un anime aleatorio.',
  usage: 'randomanime',

  run: async ({ sock, msg, chatId, reply }) => {
    try {
      const data = await fetchJson('https://api.jikan.moe/v4/random/anime')
      const anime = data?.data
      if (!anime) return reply('» No pude sacar un anime aleatorio.')

      const sinopsis = (anime.synopsis || 'Sin descripción.')
      const caption = [
        '╭─「 ANIME AL AZAR 」',
        `│ » *${anime.title}*`,
        `│ » Tipo    : ${anime.type || '—'} ${anime.episodes ? `・ ${anime.episodes} eps` : ''}`,
        `│ » Puntaje : ${anime.score ?? '—'}/10`,
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
