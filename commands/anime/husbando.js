// ╭────────────────────────────────────────────
// │  COMANDO » husbando » husbando al azar
// │  (nekos.best API, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'husbando',
  alias: ['husbandofoto'],
  category: 'anime',
  description: 'Muestra un husbando aleatorio.',
  usage: 'husbando',

  run: async ({ sock, msg, chatId, reply }) => {
    try {
      const data = await fetchJson('https://nekos.best/api/v2/husbando')
      const item = data?.results?.[0]
      if (!item?.url) return reply('» No pude traer un husbando ahora.')

      await sock.sendMessage(chatId, {
        image: { url: item.url },
        caption: '> ✿ Tu husbando del día.'
      }, { quoted: msg })
    } catch {
      await reply('» No pude traer un husbando ahora mismo.')
    }
  }
}
