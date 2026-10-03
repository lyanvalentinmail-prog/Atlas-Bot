// ╭────────────────────────────────────────────
// │  COMANDO » top
// │  Ranking de los usuarios con más monedas.
// ╰────────────────────────────────────────────
import { getTopAccounts, getAccount } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'
import { box, hint, num, rankRows } from '../../lib/ui.js'

export default {
  name: 'top',
  alias: ['ranking', 'leaderboard', 'lb'],
  category: 'economia',
  description: 'Ranking de los 10 usuarios más ricos.',
  usage: 'top',

  run: async ({ reply, sender }) => {
    const top = getTopAccounts(10)

    if (top.length === 0) return reply('» Aún nadie tiene monedas. Usa *!daily*.')

    const lines = rankRows(top, (cuenta, i) =>
      `@${cuenta.number} › *${num(cuenta.coins)}* monedas${i === 0 ? ' ✦' : ''}`)

    // Tu posición si estás fuera del top
    const mine = getAccount(sender)
    const myRank = getTopAccounts(1000).findIndex(c => c.number === getNumber(sender))
    const extra = myRank >= 10
      ? `\n> Tu posición: *#${myRank + 1}* con ${num(mine.coins)} monedas`
      : ''

    await reply(box('TOP MONEDAS', lines,
      hint(`Sigue sumando con !daily y !work.${extra}`)),
      { mentions: top.map(t => `${t.number}@s.whatsapp.net`) })
  }
}
