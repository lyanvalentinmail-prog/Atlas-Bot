// ╭────────────────────────────────────────────
// │  COMANDO » balance
// │  Muestra cuántas monedas tienes.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'balance',
  alias: ['bal', 'monedas', 'coins'],
  category: 'economia',
  description: 'Muestra tu balance de monedas.',
  usage: 'balance',

  run: async ({ reply, sender }) => {
    const account = getAccount(sender)
    await reply([
      '╭─「 BALANCE 」',
      `│ » Usuario : @${getNumber(sender)}`,
      `│ » Monedas : ${account.coins}`,
      '╰─────────────',
      `> Gana más con !daily, !apostar y !roll.`
    ].join('\n'), { mentions: [sender] })
  }
}
