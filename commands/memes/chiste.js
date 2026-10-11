// ╭────────────────────────────────────────────
// │  COMANDO » chiste » chiste al azar (lista local).
// ╰────────────────────────────────────────────
import { CHISTES } from '../../lib/data/texts.js'

export default {
  name: 'joke',
  alias: ['risa', 'chiste'],
  category: 'memes',
  description: 'Cuenta un chiste aleatorio.',
  usage: 'joke',

  run: async ({ reply }) => {
    const chiste = CHISTES[Math.floor(Math.random() * CHISTES.length)]
    await reply(`> ʕ•ᴥ•ʔ ${chiste}`)
  }
}
