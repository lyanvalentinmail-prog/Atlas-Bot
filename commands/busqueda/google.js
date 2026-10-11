// ╭────────────────────────────────────────────
// │  COMANDO » google » búsqueda web (usa la
// │  API pública de DuckDuckGo, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'google',
  alias: ['buscar', 'search', 'g'],
  category: 'busqueda',
  description: 'Realiza una búsqueda en Google.',
  usage: 'google <consulta>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}google <qué buscar>`)

    try {
      const data = await fetchJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json&no_html=1&skip_disambig=1&t=atlasbot`)

      const lineas = []
      if (data.AbstractText) lineas.push(`> ${data.AbstractText.slice(0, 400)}`)
      const temas = (data.RelatedTopics || [])
        .map(t => t.Text || t.FirstURL)
        .filter(Boolean)
        .slice(0, 4)
      for (const tema of temas) lineas.push(`· ${String(tema).slice(0, 120)}`)

      if (lineas.length === 0) {
        return reply(`> No encontré resumen para *${text}*.\n> Prueba con otra forma de preguntar.`)
      }

      await reply([`> Resultados para *${text}*:`, ...lineas].join('\n'))
    } catch {
      await reply('» La búsqueda no está disponible ahora mismo. Intenta más tarde.')
    }
  }
}
