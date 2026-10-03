// ╭────────────────────────────────────────────
// │  COMANDO » comprar » compra en la tienda.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { findItem } from '../../lib/data/shop.js'

export default {
  name: 'comprar',
  alias: ['buy', 'comprita'],
  category: 'economia',
  description: 'Compra un objeto de la tienda.',
  usage: 'comprar <id>',

  run: async ({ reply, sender, args, prefix }) => {
    if (!args[0]) return reply(`» Uso: ${prefix}comprar <id del objeto>\n» Mira los IDs con: ${prefix}tienda`)

    const item = findItem(args[0])
    if (!item) return reply(`» No existe *${args[0]}* en la tienda.`)

    const cuenta = getAccount(sender)
    if (cuenta.coins < item.price) {
      return reply(`» Te faltan monedas. *${item.name}* cuesta ${item.price} y tienes ${cuenta.coins}.`)
    }

    cuenta.coins -= item.price
    cuenta.items.push(item.id)
    saveDatabase()

    await reply(`> こ Compraste ${item.symbol} *${item.name}* por ${item.price} monedas.\n> Míralo con: ${prefix}inventario`)
  }
}
