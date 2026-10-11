// ╭────────────────────────────────────────────
// │  COMANDO » atrapar
// │  Atrapa un pokemon salvaje al azar
// │  (generación 1: #1 - #151).
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { fetchJson } from '../../lib/utils.js'

const MAX_GEN1 = 151

export default {
  name: 'catch',
  alias: ['capturar', 'atrapar'],
  category: 'pokemon',
  description: 'Atrapa un pokemon salvaje al azar.',
  usage: 'catch',

  run: async ({ sock, msg, chatId, reply, sender }) => {
    const account = getAccount(sender)
    const id = Math.floor(Math.random() * MAX_GEN1) + 1

    let pokemon
    try {
      const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`)
      pokemon = {
        id,
        name: data.name[0].toUpperCase() + data.name.slice(1),
        sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || null
      }
    } catch {
      return reply('» El pokemon escapó... intenta atraparlo de nuevo.')
    }

    const alreadyOwned = account.pokemon.some(p => p.id === id)
    if (!alreadyOwned) account.pokemon.push({ id, name: pokemon.name })

    const caption = [
      '╭─「 POKEMON SALVAJE 」',
      `│ » ¡Apareció *${pokemon.name}*! (#${id})`,
      `│ » ${alreadyOwned ? 'Ya lo tenías en tu colección.' : 'Quedó registrado en tu colección.'}`,
      `│ » Total: ${account.pokemon.length} pokemon`,
      '╰─────────────',
      '> Mira tu colección con !mispokemon'
    ].join('\n')

    if (pokemon.sprite) {
      await sock.sendMessage(chatId, { image: { url: pokemon.sprite }, caption }, { quoted: msg })
    } else {
      await reply(caption)
    }
  }
}
