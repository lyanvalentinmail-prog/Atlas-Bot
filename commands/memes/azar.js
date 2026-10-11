// ╭────────────────────────────────────────────
// │  COMANDO » azar » sorteo entre mencionados
// │  o entre texto; si nada, número 1-10.
// ╰────────────────────────────────────────────
import { getMentions, getNumber } from '../../lib/utils.js'

export default {
  name: 'pick',
  alias: ['sorteo', 'azar'],
  category: 'memes',
  description: 'Selecciona una opción al azar entre los mencionados.',
  usage: 'pick @a @b ...  ó  azar <a,b,c>',

  run: async ({ msg, reply, text, prefix }) => {
    const menciones = getMentions(msg)

    if (menciones.length >= 2) {
      const ganador = menciones[Math.floor(Math.random() * menciones.length)]
      return reply(`> こ El azar eligió a: @${getNumber(ganador)}`, { mentions: [ganador] })
    }

    const opciones = text.split(/,|\|/).map(o => o.trim()).filter(Boolean)
    if (opciones.length >= 2) {
      const elegida = opciones[Math.floor(Math.random() * opciones.length)]
      return reply(`> こ El azar eligió: *${elegida}*`)
    }

    // Sin opciones: número de la suerte 1-10
    await reply(`> No me diste opciones... tu número al azar: *${Math.floor(Math.random() * 10) + 1}*\n> (${prefix}pick @a @b  o  ${prefix}pick rojo,verde,azul)`)
  }
}
