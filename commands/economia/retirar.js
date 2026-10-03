// ╭────────────────────────────────────────────
// │  COMANDO » retirar » saca monedas del banco.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'retirar',
  alias: ['bancretirar', 'sacarmonedas'],
  category: 'economia',
  description: 'Retira monedas del banco virtual.',
  usage: 'retirar <cantidad|todo>',

  run: async ({ reply, sender, args, prefix }) => {
    const cuenta = getAccount(sender)
    let cantidad = 0

    if ((args[0] || '').toLowerCase() === 'todo') {
      cantidad = cuenta.bank
    } else {
      cantidad = Math.abs(Math.floor(Number(args[0])))
    }

    if (!cantidad || cantidad <= 0) return reply(`» Uso: ${prefix}retirar <cantidad> o ${prefix}retirar todo`)
    if (cuenta.bank < cantidad) return reply(`» Solo tienes ${cuenta.bank} en el banco.`)

    cuenta.bank -= cantidad
    cuenta.coins += cantidad
    saveDatabase()

    await reply(`> ◀ Retiraste *${cantidad}* monedas.\n> Bolsillo: ${cuenta.coins} ・ Banco: ${cuenta.bank}`)
  }
}
