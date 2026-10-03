// ╭────────────────────────────────────────────
// │  COMANDO » depositar » guarda en el banco.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'depositar',
  alias: ['bancdepor', 'guardmonedas'],
  category: 'economia',
  description: 'Guarda monedas en el banco virtual.',
  usage: 'depositar <cantidad|todo>',

  run: async ({ reply, sender, args, prefix }) => {
    const cuenta = getAccount(sender)
    let cantidad = 0

    if ((args[0] || '').toLowerCase() === 'todo') {
      cantidad = cuenta.coins
    } else {
      cantidad = Math.abs(Math.floor(Number(args[0])))
    }

    if (!cantidad || cantidad <= 0) return reply(`» Uso: ${prefix}depositar <cantidad> o ${prefix}depositar todo`)
    if (cuenta.coins < cantidad) return reply(`» Solo tienes ${cuenta.coins} monedas.`)

    cuenta.coins -= cantidad
    cuenta.bank += cantidad
    saveDatabase()

    await reply(`> ▶ Depositaste *${cantidad}* monedas.\n> Banco: ${cuenta.bank} ・ Bolsillo: ${cuenta.coins}`)
  }
}
