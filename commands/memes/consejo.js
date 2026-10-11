// ╭────────────────────────────────────────────
// │  COMANDO » consejo » consejo al azar.
// ╰────────────────────────────────────────────
import { CONSEJOS } from '../../lib/data/texts.js'

export default {
  name: 'tip',
  alias: ['advice', 'consejo'],
  category: 'memes',
  description: 'Entrega un consejo aleatorio.',
  usage: 'tip',

  run: async ({ reply }) => {
    const consejo = CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)]
    await reply(`> 〄 Consejo:\n> ${consejo}`)
  }
}
