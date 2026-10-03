// ╭────────────────────────────────────────────
// │  COMANDO » frase » frase al azar.
// ╰────────────────────────────────────────────
import { FRASES } from '../../lib/data/texts.js'

export default {
  name: 'quote',
  alias: ['frasedeldia', 'frase'],
  category: 'memes',
  description: 'Muestra una frase aleatoria.',
  usage: 'quote',

  run: async ({ reply }) => {
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
    await reply(`> ✐ ${frase}`)
  }
}
