// ╭────────────────────────────────────────────
// │  COMANDO » dato » dato curioso (API + local).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'
import { DATOS } from '../../lib/data/texts.js'

export default {
  name: 'dato',
  alias: ['fact', 'datoCurioso'],
  category: 'memes',
  description: 'Muestra un dato curioso.',
  usage: 'dato',

  run: async ({ reply }) => {
    try {
      const data = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=es', {}, 8000)
      if (data?.text) return reply(`> ଘ Dato:\n> ${data.text}`)
    } catch { /* fallback local */ }

    const dato = DATOS[Math.floor(Math.random() * DATOS.length)]
    await reply(`> ଘ Dato:\n> ${dato}`)
  }
}
