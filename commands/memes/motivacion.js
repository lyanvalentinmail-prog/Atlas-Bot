// ╭────────────────────────────────────────────
// │  COMANDO » motivacion » frase motivacional.
// ╰────────────────────────────────────────────
import { MOTIVACION } from '../../lib/data/texts.js'

export default {
  name: 'motivacion',
  alias: ['animo', 'motivate'],
  category: 'memes',
  description: 'Muestra una frase motivacional.',
  usage: 'motivacion',

  run: async ({ reply }) => {
    const frase = MOTIVACION[Math.floor(Math.random() * MOTIVACION.length)]
    await reply(`> ✯ ${frase}`)
  }
}
