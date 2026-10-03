// ╭────────────────────────────────────────────
// │  COMANDO » liberar
// │  Libera un pokémon de tu colección
// │  (por nombre o por número de la lista).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'liberar',
  alias: ['release', 'soltar'],
  category: 'pokemon',
  description: 'Libera un pokemon de tu colección.',
  usage: 'liberar <nombre o número>',

  run: async ({ reply, sender, args, prefix }) => {
    const cuenta = getAccount(sender)

    if (cuenta.pokemon.length === 0) {
      return reply(`» No tienes pokemon. Atrapa uno con ${prefix}atrapar`)
    }

    const objetivo = (args[0] || '').toLowerCase().trim()
    if (!objetivo) {
      const lista = cuenta.pokemon.map((p, i) => `${i + 1}. ${p.name}`).join('\n')
      return reply(`» ¿Cuál quieres liberar?\n${lista}\n\n» Ejemplo: ${prefix}liberar pikachu  o  ${prefix}liberar 1`)
    }

    // ¿Por número de lista?
    const numero = Number(objetivo)
    let indice = -1
    if (!Number.isNaN(numero) && numero >= 1 && numero <= cuenta.pokemon.length) {
      indice = numero - 1
    } else {
      indice = cuenta.pokemon.findIndex(p => p.name.toLowerCase() === objetivo)
    }

    if (indice === -1) {
      return reply(`» No encontré *${objetivo}* en tu colección. Mira la lista con ${prefix}mispokemon`)
    }

    const liberado = cuenta.pokemon.splice(indice, 1)[0]
    saveDatabase()

    await reply(`> Liberaste a *${liberado.name}*. ¡Adiós, amigo! ᕙ(⇀‸↼)ᕗ`)
  }
}
