// ╭────────────────────────────────────────────
// │  COMANDO » retirar » saca monedas del banco.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'withdraw',
  alias: ['bancretirar', 'sacarmonedas', 'retirar'],
  category: 'economia',
  description: 'Retira monedas del banco virtual.',
  usage: 'withdraw <cantidad|todo>',

  run: async ({ reply, sender, args, prefix }) => {
    const cuenta = getAccount(sender)
    let cantidad = 0

    if ((args[0] || '').toLowerCase() === 'todo') {
      cantidad = cuenta.bank
    } else {
      cantidad = Math.abs(Math.floor(Number(args[0])))
    }

    if (!cantidad || cantidad <= 0) return reply(`» Uso: ${prefix}withdraw <cantidad> o ${prefix}withdraw todo`)
    if (cuenta.bank < cantidad) return reply(`» Solo tienes ${cuenta.bank} en el banco.`)

    cuenta.bank -= cantidad
    cuenta.coins += cantidad
    saveDatabase()

    await reply(`> ◀ Retiraste *${cantidad}* monedas.\n> Bolsillo: ${cuenta.coins} ・ Banco: ${cuenta.bank}`)
  }
}
