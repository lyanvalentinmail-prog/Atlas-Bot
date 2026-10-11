// ╭────────────────────────────────────────────
// │  COMANDO » wiki
// │  Resumen de Wikipedia en español
// │  (API gratuita, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'wiki',
  alias: ['wikipedia'],
  category: 'busqueda',
  description: 'Busca un resumen en Wikipedia.',
  usage: 'wiki <tema>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}wiki <tema>`)

    try {
      const data = await fetchJson(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`
      )
      if (!data?.extract) throw new Error('sin resultados')

      const extract = data.extract.length > 900
        ? data.extract.slice(0, 900).trimEnd() + '...' : data.extract

      await reply([
        `╭─「 WIKIPEDIA 」`,
        `│ » *${data.title}*`,
        '╰─────────────',
        '',
        extract,
        '',
        `> Más info: ${data.content_urls?.desktop?.page}`
      ].join('\n'))
    } catch {
      await reply(`» No encontré *${text}* en Wikipedia. Intenta con otras palabras.`)
    }
  }
}
