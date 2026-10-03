// ╭────────────────────────────────────────────
// │  COMANDO » buscarpj
// │  Busca un personaje del gacha por nombre
// │  y muestra sus datos y rareza.
// ╰────────────────────────────────────────────
import { CHARACTERS } from '../../lib/data/characters.js'
import { box, stars } from '../../lib/ui.js'

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

    const total = encontrados.length
    await reply(box(`RESULTADOS ・ ${total}`, [
      ...encontrados.slice(0, 5).flatMap((pj, i, arr) => [
        `│ *${pj.name}*`,
        `│ › Rareza : ${stars(pj.rarity)}`,
        ...(i < arr.length - 1 ? ['│─────────────'] : [])
      ]),
      ...(total > 5 ? [`│ … y ${total - 5} resultado(s) más`] : [])
    ]))
  }
}
