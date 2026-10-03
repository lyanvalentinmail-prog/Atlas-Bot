// ╭────────────────────────────────────────────
// │  COMANDO » anime
// │  Información de un anime (Jikan API,
// │  gratuita y sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'anime',
  alias: ['animeinfo', 'otaku'],
  category: 'busqueda',
  description: 'Busca información de un anime.',
  usage: 'anime <nombre>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}anime <nombre>\n» Ejemplo: ${prefix}anime naruto`)

    try {
      const data = await fetchJson(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`
      )
      const anime = data?.data?.[0]
      if (!anime) return reply(`» No encontré el anime *${text}*.`)

      const sinopsis = (anime.synopsis || 'Sin descripción.')
      const caption = [
        `╭─「 ANIME 」`,
        `│ » Título    : ${anime.title}`,
        `│ » Tipo      : ${anime.type || '?'} ・ ${anime.episodes || '?'} episodios`,
        `│ » Puntaje   : ${anime.score ?? '—'} / 10`,
        `│ » Estado    : ${anime.status || '—'}`,
        '╰─────────────',
        `> ${sinopsis.length > 400 ? sinopsis.slice(0, 400).trimEnd() + '...' : sinopsis}`
      ].join('\n')

      const image = anime.images?.jpg?.image_url
      if (image) {
        await sock.sendMessage(chatId, { image: { url: image }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply('» No se pudo buscar el anime. Intenta más tarde.')
    }
  }
}
