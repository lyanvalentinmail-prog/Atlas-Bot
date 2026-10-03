// ╭────────────────────────────────────────────
// │  COMANDO » manga » busca manga (Jikan API).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'manga',
  alias: ['mangainfo', 'leer'],
  category: 'anime',
  description: 'Busca información sobre un manga.',
  usage: 'manga <título>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}manga <título>`)

    try {
      const data = await fetchJson(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=1`)
      const manga = data?.data?.[0]
      if (!manga) return reply(`» No encontré el manga *${text}*.`)

      const sinopsis = (manga.synopsis || 'Sin descripción.')
      const caption = [
        '╭─「 MANGA 」',
        `│ » Título  : ${manga.title}${manga.title_japanese ? ` (${manga.title_japanese})` : ''}`,
        `│ » Tipo    : ${manga.type || '—'} ・ ${manga.chapters ?? '?'} capítulos`,
        `│ » Puntaje : ${manga.score ?? '—'}/10`,
        `│ » Estado  : ${manga.status || '—'}`,
        '╰─────────────',
        `> ${sinopsis.length > 350 ? sinopsis.slice(0, 350).trimEnd() + '...' : sinopsis}`
      ].join('\n')

      const imagen = manga.images?.jpg?.image_url
      if (imagen) {
        await sock.sendMessage(chatId, { image: { url: imagen }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply('» No se pudo buscar el manga ahora mismo.')
    }
  }
}
