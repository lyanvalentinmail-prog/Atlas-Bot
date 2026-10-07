// ╭────────────────────────────────────────────
// │  COMANDO » inventario » tus objetos,
// │  agrupados por cantidad.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { ITEMS } from '../../lib/data/shop.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { box, hint, num } from '../../lib/ui.js'

export default {
  name: 'inventory',
  alias: ['inv', 'mochila', 'inventario'],
  category: 'economia',
  description: 'Muestra tus objetos y recompensas.',
  usage: 'inventory [@usuario]',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)

    // Agrupa repetidos: [{item, qty}]
    const grupos = new Map()
    for (const id of cuenta.items) {
      const item = ITEMS.find(i => i.id === id)
      const key = item ? item.id : id
      grupos.set(key, (grupos.get(key) || 0) + 1)
    }

    const totalValor = [...grupos.keys()].reduce((sum, id) => {
      const item = ITEMS.find(i => i.id === id)
      return sum + (item ? item.price * (grupos.get(id) || 1) : 0)
    }, 0)

    const rows = grupos.size
      ? [...grupos.entries()].map(([id, qty]) => {
          const item = ITEMS.find(i => i.id === id)
          const nombre = item ? `${item.symbol} ${item.name}` : `⁝ ${id}`
          const precio = item ? num(item.price) : '—'
          return `│ ${nombre}${qty > 1 ? ` *x${qty}*` : ''} ・ ${precio} monedas`
        })
      : ['│ (vacío)']

    await reply(box(`INVENTARIO DE @${getNumber(target)}`, [
      ...rows,
      '│─────────────',
      `│ Total: ${cuenta.items.length} objeto(s) ・ valor ≈ ${num(totalValor)} monedas`
    ], hint(`Compra en ${prefix}shop ・ vende con ${prefix}sell <id>`)),
      { mentions: [target] })
  }
}
