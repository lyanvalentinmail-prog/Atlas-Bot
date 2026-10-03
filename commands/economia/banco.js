// ╭────────────────────────────────────────────
// │  COMANDO » banco » saldo bancario
// │  (bolsillo, banco y total).
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { box, kv, hint, num } from '../../lib/ui.js'

export default {
  name: 'bank',
  alias: ['saldocuenta', 'banco'],
  category: 'economia',
  description: 'Muestra tu saldo bancario.',
  usage: 'bank [@usuario]',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)

    await reply(box('BANCO', [
      kv('Usuario', `@${getNumber(target)}`),
      kv('Bolsillo', `${num(cuenta.coins)} monedas`),
      kv('Banco', `${num(cuenta.bank)} monedas`),
      kv('Total', `*${num(cuenta.coins + cuenta.bank)}* monedas`)
    ], hint(`Ahorra con ${prefix}deposit / retira con ${prefix}withdraw <cantidad>`)),
      { mentions: [target] })
  }
}
