// ╭────────────────────────────────────────────
// │  COMANDO » mispokemon
// │  Muestra los pokemon que has atrapado.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'

export default {
  name: 'mypokemon',
  alias: ['pokecoleccion', 'pokeball', 'mispokemon'],
  category: 'pokemon',
  description: 'Muestra tu colección de pokemon.',
  usage: 'mypokemon',

  run: async ({ reply, sender }) => {
    const account = getAccount(sender)

    if (account.pokemon.length === 0) {
      return reply('> Aún no atrapas ningún pokemon.\n> Usa !atrapar para empezar tu colección.')
    }

    const sorted = [...account.pokemon].sort((a, b) => a.id - b.id)
    const lines = sorted.map(p => `│ » #${String(p.id).padStart(3, '0')} ${p.name}`)

    await reply([
      `╭─「 TUS POKEMON ・ ${sorted.length} 」`,
      ...lines,
      '╰─────────────'
    ].join('\n'))
  }
}
