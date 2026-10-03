// ╭────────────────────────────────────────────
// │  COMANDO » banco » saldo bancario.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'bank',
  alias: ['saldocuenta', 'banco'],
  category: 'economia',
  description: 'Muestra tu saldo bancario.',
  usage: 'bank [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)

    await reply([
      '╭─「 BANCO 」',
      `│ » Usuario  : @${getNumber(target)}`,
      `│ » Bolsillo : ${cuenta.coins} monedas`,
      `│ » Banco    : ${cuenta.bank} monedas`,
      `│ » Total    : ${cuenta.coins + cuenta.bank} monedas`,
      '╰─────────────'
    ].join('\n'), { mentions: [target] })
  }
}
