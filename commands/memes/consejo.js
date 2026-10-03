// ╭────────────────────────────────────────────
// │  COMANDO » consejo » consejo al azar.
// ╰────────────────────────────────────────────
import { CONSEJOS } from '../../lib/data/texts.js'

export default {
  name: 'consejo',
  alias: ['tip', 'advice'],
  category: 'memes',
  description: 'Entrega un consejo aleatorio.',
  usage: 'consejo',

  run: async ({ reply }) => {
    const consejo = CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)]
    await reply(`> 〄 Consejo:\n> ${consejo}`)
  }
}
