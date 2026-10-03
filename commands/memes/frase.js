// ╭────────────────────────────────────────────
// │  COMANDO » frase » frase al azar.
// ╰────────────────────────────────────────────
import { FRASES } from '../../lib/data/texts.js'

export default {
  name: 'frase',
  alias: ['quote', 'frasedeldia'],
  category: 'memes',
  description: 'Muestra una frase aleatoria.',
  usage: 'frase',

  run: async ({ reply }) => {
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
    await reply(`> ✐ ${frase}`)
  }
}
