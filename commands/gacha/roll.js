// ╭────────────────────────────────────────────
// │  COMANDO » roll
// │  Tirada de gacha: gasta monedas y obtén un
// │  personaje al azar (hay raros y legendarios).
// │  Los personajes se editan en lib/data/characters.js
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { CHARACTERS, rollCharacter } from '../../lib/data/characters.js'

export default {
  name: 'roll',
  alias: ['rw', 'gacha'],
  category: 'gacha',
  description: `Tirada de gacha: obtén un personaje al azar.`,
  usage: 'roll',

  run: async ({ sock, msg, chatId, reply, sender, config }) => {
    const account = getAccount(sender)
    const cost = config.game.gachaCost

    if (account.coins < cost) {
      return reply(
        `> Una tirada cuesta *${cost}* monedas y tienes *${account.coins}*.\n` +
        `> Gana más con !daily o !apostar.`
      )
    }

    account.coins -= cost
    const character = rollCharacter()
    const stars = '★'.repeat(character.rarity) + '☆'.repeat(4 - character.rarity)
    const isNew = !account.characters.includes(character.name)

    if (isNew) {
      account.characters.push(character.name)
    } else {
      account.coins += config.game.gachaRefund
    }

    const caption = [
      '╭─「 TIRADA GACHA 」',
      `│ » ${character.name}`,
      `│ » Rareza    : ${stars}`,
      `│ » Estado    : ${isNew ? 'NUEVO en tu colección' : `Repetido (+${config.game.gachaRefund} monedas)`}`,
      `│ » Balance   : ${account.coins} monedas`,
      '╰─────────────',
      `> Tu colección: ${account.characters.length}/${CHARACTERS.length} » !personajes`
    ].join('\n')

    // Si el personaje tiene imagen en lib/data/characters.js, la envía
    if (character.image) {
      await sock.sendMessage(chatId, { image: { url: character.image }, caption }, { quoted: msg })
    } else {
      await reply(caption)
    }
  }
}
