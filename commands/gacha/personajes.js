// ╭────────────────────────────────────────────
// │  COMANDO » personajes
// │  Muestra tu colección de personajes del gacha
// │  ordenada por rareza, con tu progreso total.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { CHARACTERS } from '../../lib/data/characters.js'
import { box, hint, stars, bar } from '../../lib/ui.js'

export default {
  name: 'characters',
  alias: ['coleccion', 'waifus', 'personajes'],
  category: 'gacha',
  description: 'Muestra tus personajes obtenidos en el gacha.',
  usage: 'characters',

  run: async ({ reply, sender, prefix }) => {
    const account = getAccount(sender)

    if (account.characters.length === 0) {
      return reply(`> Aún no tienes personajes.\n> Usa ${prefix}roll para hacer tu primera tirada.`)
    }

    const owned = account.characters
      .map(name => CHARACTERS.find(c => c.name === name))
      .filter(Boolean)
      .sort((a, b) => b.rarity - a.rarity)

    const unicos = new Set(owned.map(c => c.name)).size
    const porRareza = [4, 3, 2, 1]
      .map(r => ({ r, n: owned.filter(c => c.rarity === r).length }))
      .filter(x => x.n > 0)

    const lines = owned.slice(0, 30).map(c =>
      `│ ${stars(c.rarity)} ${c.name}`)

    await reply(box(`TU COLECCIÓN ・ ${unicos}/${CHARACTERS.length}`, [
      ...lines,
      ...(owned.length > 30 ? [`│ … y ${owned.length - 30} más`] : []),
      '│─────────────',
      `│ Progreso: ${bar(unicos, CHARACTERS.length, 12)} ${unicos}/${CHARACTERS.length}`,
      ...porRareza.map(x => `│ ${stars(x.r)} › ${x.n}`)
    ], hint(`Más tiradas: ${prefix}roll ・ busca uno: ${prefix}findchar <nombre>`)))
  }
}
