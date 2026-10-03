// ╭────────────────────────────────────────────
// │  COMANDO » inventario » tus objetos.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { ITEMS } from '../../lib/data/shop.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'inventario',
  alias: ['inv', 'mochila'],
  category: 'economia',
  description: 'Muestra tus objetos y recompensas.',
  usage: 'inventario [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)

    const objetos = cuenta.items.length
      ? cuenta.items.map(id => {
          const item = ITEMS.find(i => i.id === id)
          return item ? `${item.symbol} ${item.name}` : `⁝ ${id}`
        }).join('\n')
      : '(vacío)'

    await reply([
      `╭─「 INVENTARIO DE @${getNumber(target)} 」`,
      objetos,
      '╰─────────────',
      `> ${cuenta.items.length} objeto(s) ・ tienda: !tienda`
    ].join('\n'), { mentions: [target] })
  }
}
