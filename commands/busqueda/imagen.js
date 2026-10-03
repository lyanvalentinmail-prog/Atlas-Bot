// ╭────────────────────────────────────────────
// │  COMANDO » imagen » busca imágenes libres
// │  (Openverse API, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'imagen',
  alias: ['img', 'foto', 'pic'],
  category: 'busqueda',
  description: 'Busca imágenes relacionadas con un término.',
  usage: 'imagen <término>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    // Evita confundirse con la categoría "imagenes"
    if (!text) return reply(`» Uso: ${prefix}imagen <qué buscar>`)

    try {
      const data = await fetchJson(
        `https://api.openverse.org/v1/images/?q=${encodeURIComponent(text)}&page_size=10&license_type=commercial`
      )
      const resultados = (data?.results || []).filter(r => r.url)
      if (resultados.length === 0) return reply(`» No encontré imágenes libres de *${text}*.`)

      const imagen = resultados[Math.floor(Math.random() * resultados.length)]
      await sock.sendMessage(chatId, {
        image: { url: imagen.url },
        caption: `> 〄 ${imagen.title || text}\n> Fuente: ${imagen.foreign_landing_url || imagen.url}`
      }, { quoted: msg })
    } catch {
      await reply('» No pude buscar imágenes ahora mismo.')
    }
  }
}
