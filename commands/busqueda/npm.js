// ╭────────────────────────────────────────────
// │  COMANDO » npm » busca paquetes.
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'npm',
  alias: ['npmpackage', 'paquete'],
  category: 'busqueda',
  description: 'Busca paquetes disponibles en NPM.',
  usage: 'npm <paquete>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}npm <paquete>`)

    try {
      const data = await fetchJson(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=5`)
      const paquetes = data?.objects
      if (!paquetes?.length) return reply(`» No encontré paquetes de *${text}*.`)

      const lineas = paquetes.map(p =>
        `・ *${p.package.name}* v${p.package.version}\n> ${(p.package.description || 'sin descripción').slice(0, 100)}\n> ${p.package.links.npm}`)
      await reply([`> NPM » *${text}*:`, ...lineas].join('\n\n'))
    } catch {
      await reply('» NPM no responde ahora mismo.')
    }
  }
}
