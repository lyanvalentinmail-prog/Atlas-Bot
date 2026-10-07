// ╭────────────────────────────────────────────
// │  COMANDO » meme2 » meme al azar de Reddit
// │  (meme-api, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'meme2',
  alias: ['memerd', 'memerandom'],
  category: 'memes',
  description: 'Genera un meme aleatorio.',
  usage: 'meme2 [subreddit]',

  run: async ({ sock, msg, chatId, reply, args }) => {
    const sub = (args[0] || 'SpanishMeme').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30) || 'SpanishMeme'

    try {
      const data = await fetchJson(`https://meme-api.com/gimme/${encodeURIComponent(sub)}`)
      if (!data?.url || data.nsfw) return reply('» No encontré meme seguro ahora. Prueba otra vez.')

      await sock.sendMessage(chatId, {
        image: { url: data.url },
        caption: `> 〄 r/${data.subreddit}\n> ${(data.title || '').slice(0, 150)}`
      }, { quoted: msg })
    } catch {
      await reply('» No pude traer un meme ahora mismo.')
    }
  }
}
