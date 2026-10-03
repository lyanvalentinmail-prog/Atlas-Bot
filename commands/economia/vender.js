// ╭────────────────────────────────────────────
// │  COMANDO » vender » vende un objeto (60% del valor).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { findItem } from '../../lib/data/shop.js'

export default {
  name: 'vender',
  alias: ['sell', 'venta'],
  category: 'economia',
  description: 'Vende un objeto de tu inventario.',
  usage: 'vender <id>',

  run: async ({ reply, sender, args, prefix }) => {
    if (!args[0]) return reply(`» Uso: ${prefix}vender <id del objeto>`)

    const cuenta = getAccount(sender)
    const item = findItem(args[0])
    if (!item) return reply(`» No conozco *${args[0]}*.`)

    const indice = cuenta.items.indexOf(item.id)
    if (indice === -1) return reply(`» No tienes *${item.name}* en tu inventario.`)

    const valorVenta = Math.floor(item.price * 0.6)
    cuenta.items.splice(indice, 1)
    cuenta.coins += valorVenta
    saveDatabase()

    await reply(`> ⇄ Vendiste ${item.symbol} *${item.name}* por *${valorVenta}* monedas (60% del valor).\n> Saldo: ${cuenta.coins}`)
  }
}
