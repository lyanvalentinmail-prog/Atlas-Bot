// ╭────────────────────────────────────────────
// │  COMANDO » tienda » abre la tienda virtual.
// ╰────────────────────────────────────────────
import { shopText } from '../../lib/data/shop.js'

export default {
  name: 'shop',
  alias: ['store', 'tienda'],
  category: 'economia',
  description: 'Abre la tienda de objetos virtuales.',
  usage: 'shop',

  run: async ({ reply }) => {
    await reply(shopText())
  }
}
