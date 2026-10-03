// ╭────────────────────────────────────────────
// │  COMANDO » tienda » abre la tienda virtual.
// ╰────────────────────────────────────────────
import { shopText } from '../../lib/data/shop.js'

export default {
  name: 'tienda',
  alias: ['shop', 'store'],
  category: 'economia',
  description: 'Abre la tienda de objetos virtuales.',
  usage: 'tienda',

  run: async ({ reply }) => {
    await reply(shopText())
  }
}
