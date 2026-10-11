// ╭────────────────────────────────────────────
// │  COMANDO » daily
// │  Reclama tu recompensa diaria de monedas.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { formatUptime } from '../../lib/utils.js'

const DAY = 24 * 60 * 60 * 1000

export default {
  name: 'daily',
  alias: ['diario', 'recompensa'],
  category: 'economia',
  description: 'Reclama monedas gratis cada 24 horas.',
  usage: 'daily',

  run: async ({ reply, sender, config }) => {
    const account = getAccount(sender)
    const now = Date.now()

    if (now - account.lastDaily < DAY) {
      const remaining = formatUptime((account.lastDaily + DAY - now) / 1000)
      return reply(`> Ya reclamaste tu recompensa diaria.\n> Vuelve en: *${remaining}*`)
    }

    account.lastDaily = now
    account.coins += config.game.dailyReward

    await reply([
      '╭─「 RECOMPENSA DIARIA 」',
      `│ » Ganaste   : +${config.game.dailyReward} monedas`,
      `│ » Tu balance: ${account.coins} monedas`,
      '╰─────────────',
      `> Vuelve mañana por más.`
    ].join('\n'))
  }
}
