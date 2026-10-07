// ╭────────────────────────────────────────────
// │  COMANDO » sinonimo » sinónimos de palabra.
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'synonym',
  alias: ['sinonimos', 'syn', 'sinonimo'],
  category: 'busqueda',
  description: 'Busca sinónimos de una palabra.',
  usage: 'synonym <palabra>',

  run: async ({ reply, args, prefix }) => {
    const palabra = (args[0] || '').toLowerCase().trim()
    if (!palabra) return reply(`» Uso: ${prefix}synonym <palabra>`)

    for (const idioma of ['es', 'en']) {
      try {
        const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/${idioma}/${encodeURIComponent(palabra)}`)
        const sins = (data?.[0]?.meanings || [])
          .flatMap(m => [...(m.synonyms || []), ...(m.definitions || []).flatMap(d => d.synonyms || [])])
        const unicos = [...new Set(sins.filter(Boolean))].slice(0, 10)
        if (unicos.length) {
          return reply(`> Sinónimos de *${palabra}*:\n> ${unicos.join(' ・ ')}`)
        }
      } catch { /* siguiente idioma */ }
    }

    await reply(`» No encontré sinónimos de *${palabra}*.`)
  }
}
