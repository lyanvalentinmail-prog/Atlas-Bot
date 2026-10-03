// ╭────────────────────────────────────────────
// │  COMANDO » motivacion » frase motivacional.
// ╰────────────────────────────────────────────
import { MOTIVACION } from '../../lib/data/texts.js'

export default {
  name: 'motivation',
  alias: ['animo', 'motivate', 'motivacion'],
  category: 'memes',
  description: 'Muestra una frase motivacional.',
  usage: 'motivation',

  run: async ({ reply }) => {
    const frase = MOTIVACION[Math.floor(Math.random() * MOTIVACION.length)]
    await reply(`> ✯ ${frase}`)
  }
}
