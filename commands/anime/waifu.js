// ╭────────────────────────────────────────────
// │  COMANDO » waifu » waifu al azar (waifu.pics).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'waifu',
  alias: ['wifu', 'waifufoto'],
  category: 'anime',
  description: 'Muestra una waifu aleatoria.',
  usage: 'waifu',

  run: async ({ sock, msg, chatId, reply }) => {
    try {
      const data = await fetchJson('https://api.waifu.pics/sfw/waifu')
      if (!data?.url) return reply('» No pude traer una waifu ahora.')

      await sock.sendMessage(chatId, {
        image: { url: data.url },
        caption: '> ✿ Tu waifu del día.'
      }, { quoted: msg })
    } catch {
      await reply('» No pude traer una waifu ahora mismo.')
    }
  }
}
