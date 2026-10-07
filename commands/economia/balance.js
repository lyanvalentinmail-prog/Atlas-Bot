// ╭────────────────────────────────────────────
// │  COMANDO » balance
// │  Muestra cuántas monedas tienes
// │  (bolsillo + banco + total).
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'
import { box, kv, hint, num } from '../../lib/ui.js'

export default {
  name: 'balance',
  alias: ['bal', 'monedas', 'coins'],
  category: 'economia',
  description: 'Muestra tu balance de monedas.',
  usage: 'balance',

  run: async ({ reply, sender, prefix }) => {
    const account = getAccount(sender)
    const total = account.coins + (account.bank || 0)

    await reply(box('TU BALANCE', [
      kv('Usuario', `@${getNumber(sender)}`),
      kv('Bolsillo', `*${num(account.coins)}* monedas`),
      kv('Banco', `${num(account.bank || 0)} monedas`),
      kv('Total', `*${num(total)}* monedas`),
      kv('Nivel', `${account.level} ・ ${num(account.exp)} exp`),
      kv('Objetos', `${account.items.length}`),
      kv('Reputación', `${account.rep} pts`)
    ], hint(`Gana más con ${prefix}daily, ${prefix}work, ${prefix}apostar y ${prefix}slot.`)),
      { mentions: [sender] })
  }
}
