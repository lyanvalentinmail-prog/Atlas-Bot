// ╭────────────────────────────────────────────
// │  COMANDO » apostar
// │  Apuesta tus monedas a cara o cruz.
// │  Acierta y duplicas; falla y pierdes.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'

export default {
  name: 'bet',
  alias: ['apuesta', 'apostar'],
  category: 'economia',
  description: 'Apuesta monedas a cara o cruz.',
  usage: 'bet <cantidad> <cara|cruz>',

  run: async ({ reply, args, sender, prefix, config }) => {
    const amount = Number(args[0])
    const guess = (args[1] || '').toLowerCase()

    if (!Number.isInteger(amount) || amount < config.game.minBet || !['cara', 'cruz'].includes(guess)) {
      return reply(
        `» Uso: ${prefix}bet <cantidad> <cara|cruz>\n` +
        `» Ejemplo: ${prefix}bet 50 cara\n` +
        `» Apuesta mínima: ${config.game.minBet} monedas`
      )
    }

    const account = getAccount(sender)
    if (account.coins < amount) {
      return reply(`» No tienes suficientes monedas. Tu balance: *${account.coins}*`)
    }

    const result = Math.random() < 0.5 ? 'cara' : 'cruz'
    const won = guess === result
    account.coins += won ? amount : -amount

    await reply([
      '╭─「 APUESTA 」',
      `│ » Elegiste  : ${guess}`,
      `│ » Salió     : ${result}`,
      `│ » Resultado : ${won ? `+${amount}` : `-${amount}`} monedas`,
      `│ » Balance   : ${account.coins} monedas`,
      '╰─────────────',
      won ? '> ¡Ganaste! Duplicaste tu apuesta.' : '> Perdiste... la próxima será.'
    ].join('\n'))
  }
}
