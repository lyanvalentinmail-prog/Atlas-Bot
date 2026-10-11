// ╭────────────────────────────────────────────
// │  COMANDO » gif » GIF de Reddit (JSON público).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'gif',
  alias: ['gifs'],
  category: 'busqueda',
  description: 'Busca GIFs relacionados con una palabra.',
  usage: 'gif <término>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}gif <qué buscar>`)

    try {
      const data = await fetchJson(
        `https://www.reddit.com/r/gifs/search.json?q=${encodeURIComponent(text)}&restrict_sr=1&limit=15&sort=relevance`,
        { headers: { 'User-Agent': 'AtlasBot/1.0' } }
      )

      const posts = (data?.data?.children || [])
        .map(p => p.data)
        .filter(p => p.url && /\.(gif|mp4)/i.test(p.url) && !p.over_18)

      if (posts.length === 0) return reply(`» No encontré GIFs de *${text}*.`)

      const elegido = posts[Math.floor(Math.random() * posts.length)]
      await sock.sendMessage(chatId, {
        video: { url: elegido.url },
        gifPlayback: true,
        caption: `> 〄 ${elegido.title.slice(0, 120)}`
      }, { quoted: msg })
    } catch {
      await reply('» No pude buscar GIFs ahora mismo.')
    }
  }
}
