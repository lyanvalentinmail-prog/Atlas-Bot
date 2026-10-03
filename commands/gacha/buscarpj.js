// ╭────────────────────────────────────────────
// │  COMANDO » buscarpj
// │  Busca un personaje del gacha por nombre
// │  y muestra suas datos y rareza.
// ╰────────────────────────────────────────────
import { CHARACTERS } from '../../lib/data/characters.js'

export default {
  name: 'findchar',
  alias: ['buscarchara', 'charainfo', 'infochara', 'buscarpj'],
  category: 'gacha',
  description: 'Busca un personaje del gacha por nombre.',
  usage: 'findchar <nombre>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}findchar <nombre>\n» Ejemplo: ${prefix}findchar luffy`)

    const consulta = text.toLowerCase()
    const encontrados = CHARACTERS.filter(pj =>
      pj.name.toLowerCase().includes(consulta)
    )

    if (encontrados.length === 0) {
      return reply(`» No encontré *${text}* en el gacha. Usa ${prefix}characters para ver todos.`)
    }

    const lineas = encontrados.slice(0, 5).map(pj => {
      const estrellas = '★'.repeat(pj.rarity) + '☆'.repeat(4 - pj.rarity)
      return `> *${pj.name}*\n> Rareza: ${estrellas}`
    })

    await reply(lineas.join('\n\n'))
  }
}
