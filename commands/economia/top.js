// ╭────────────────────────────────────────────
// │  COMANDO » top
// │  Ranking de los usuarios con más monedas.
// ╰────────────────────────────────────────────
import { getTopAccounts } from '../../lib/database.js'

export default {
  name: 'top',
  alias: ['ranking', 'leaderboard', 'lb'],
  category: 'economia',
  description: 'Ranking de los 10 usuarios más ricos.',
  usage: 'top',

  run: async ({ reply }) => {
    const top = getTopAccounts(10)

    if (top.length === 0) return reply('» Aún nadie tiene monedas. Usa *!daily*.')

    const lineas = top.map((cuenta, i) => {
      const medalla = i === 0 ? 'ᯓ 1.' : `${i + 1}.`
      return `${medalla} @${cuenta.number} ─ ${cuenta.coins} monedas`
    })

    await reply([
      '╭─「 TOP MONEDAS 」',
      ...lineas,
      '╰─────────────'
    ].join('\n'), { mentions: top.map(t => `${t.number}@s.whatsapp.net`) })
  }
}
