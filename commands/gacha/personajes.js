// ╭────────────────────────────────────────────
// │  COMANDO » personajes
// │  Muestra tu colección de personajes del gacha.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { CHARACTERS } from '../../lib/data/characters.js'

export default {
  name: 'personajes',
  alias: ['coleccion', 'waifus'],
  category: 'gacha',
  description: 'Muestra tus personajes obtenidos en el gacha.',
  usage: 'personajes',

  run: async ({ reply, sender }) => {
    const account = getAccount(sender)

    if (account.characters.length === 0) {
      return reply('> Aún no tienes personajes.\n> Usa !roll para hacer tu primera tirada.')
    }

    const owned = account.characters
      .map(name => CHARACTERS.find(c => c.name === name))
      .filter(Boolean)
      .sort((a, b) => b.rarity - a.rarity)

    const lines = owned.map(c =>
      `│ » ${c.name} ${'★'.repeat(c.rarity)}`
    )

    await reply([
      `╭─「 TU COLECCIÓN ・ ${owned.length}/${CHARACTERS.length} 」`,
      ...lines,
      '╰─────────────'
    ].join('\n'))
  }
}
