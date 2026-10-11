// ╭────────────────────────────────────────────
// │  COMANDO » define » definición de palabra
// │  (dictionaryapi.dev, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'define',
  alias: ['definicion', 'definir'],
  category: 'busqueda',
  description: 'Busca la definición de una palabra.',
  usage: 'define <palabra>',

  run: async ({ reply, args, prefix }) => {
    const palabra = (args[0] || '').toLowerCase().trim()
    if (!palabra || !/^[\p{L}\s-]+$/u.test(palabra)) {
      return reply(`» Uso: ${prefix}define <palabra>\n» Ejemplo: ${prefix}define atlas`)
    }

    // Primero intenta español, luego inglés
    for (const idioma of ['es', 'en']) {
      try {
        const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/${idioma}/${encodeURIComponent(palabra)}`)
        const entrada = data?.[0]
        if (!entrada) continue

        const significados = (entrada.meanings || []).flatMap(m =>
          (m.definitions || []).slice(0, 2).map(d => ({
            clase: m.partOfSpeech, def: d.definition
          }))).slice(0, 4)

        if (significados.length === 0) continue

        const lineas = significados.map(s => `・ (${s.clase}) ${s.def.slice(0, 200)}`)
        return reply([`> *${palabra}* (${idioma === 'es' ? 'español' : 'inglés'}):`, ...lineas].join('\n'))
      } catch { /* prueba el siguiente idioma */ }
    }

    await reply(`» No encontré definición de *${palabra}*.`)
  }
}
