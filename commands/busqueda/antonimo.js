// ╭────────────────────────────────────────────
// │  COMANDO » antonimo » antónimos de palabra.
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'antonym',
  alias: ['antónimo', 'antonimos', 'antonimo'],
  category: 'busqueda',
  description: 'Busca antónimos de una palabra.',
  usage: 'antonym <palabra>',

  run: async ({ reply, args, prefix }) => {
    const palabra = (args[0] || '').toLowerCase().trim()
    if (!palabra) return reply(`» Uso: ${prefix}antonym <palabra>`)

    for (const idioma of ['es', 'en']) {
      try {
        const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/${idioma}/${encodeURIComponent(palabra)}`)
        const ants = (data?.[0]?.meanings || [])
          .flatMap(m => [...(m.antonyms || []), ...(m.definitions || []).flatMap(d => d.antonyms || [])])
        const unicos = [...new Set(ants.filter(Boolean))].slice(0, 10)
        if (unicos.length) {
          return reply(`> Antónimos de *${palabra}*:\n> ${unicos.join(' ・ ')}`)
        }
      } catch { /* siguiente idioma */ }
    }

    await reply(`» No encontré antónimos de *${palabra}*.`)
  }
}
