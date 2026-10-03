// ╭────────────────────────────────────────────
// │  COMANDO » mispokemon
// │  Muestra los pokemon que has atrapado,
// │  con variocolor marcado y totales.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { box, hint } from '../../lib/ui.js'

export default {
  name: 'mypokemon',
  alias: ['pokecoleccion', 'pokeball', 'mispokemon'],
  category: 'pokemon',
  description: 'Muestra tu colección de pokemon.',
  usage: 'mypokemon',

  run: async ({ reply, sender, prefix }) => {
    const account = getAccount(sender)

    if (account.pokemon.length === 0) {
      return reply(`> Aún no atrapas ningún pokemon.\n> Usa ${prefix}catch para empezar tu colección.`)
    }

    const shiny = account.pokemon.filter(p => p.shiny).length
    const sorted = [...account.pokemon].sort((a, b) => a.id - b.id)
    const lines = sorted.slice(0, 40).map(p =>
      `│ #${String(p.id).padStart(3, '0')} ${p.name}${p.shiny ? ' ✦ variocolor' : ''}`)

    await reply(box(`TUS POKEMON ・ ${sorted.length}`, [
      ...lines,
      ...(sorted.length > 40 ? [`│ … y ${sorted.length - 40} más`] : [])
    ], hint(`Atrapa más con ${prefix}catch ・ suelta con ${prefix}release <número>`)))
  }
}
