// ╭────────────────────────────────────────────
// │  COMANDO » animefoto » imagen del anime (Jikan).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'animepic',
  alias: ['animeimg', 'animefoto'],
  category: 'anime',
  description: 'Busca una imagen de un anime.',
  usage: 'animepic <título>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}animepic <título del anime>`)

    try {
      const data = await fetchJson(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1&sfw`)
      const anime = data?.data?.[0]
      const imagen = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url
      if (!imagen) return reply(`» No encontré imagen de *${text}*.`)

      await sock.sendMessage(chatId, {
        image: { url: imagen },
        caption: `> 〄 ${anime.title}`
      }, { quoted: msg })
    } catch {
      await reply('» No pude buscar la imagen ahora mismo.')
    }
  }
}
