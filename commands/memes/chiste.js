// ╭────────────────────────────────────────────
// │  COMANDO » chiste » chiste al azar (lista local).
// ╰────────────────────────────────────────────
import { CHISTES } from '../../lib/data/texts.js'

export default {
  name: 'chiste',
  alias: ['joke', 'risa'],
  category: 'memes',
  description: 'Cuenta un chiste aleatorio.',
  usage: 'chiste',

  run: async ({ reply }) => {
    const chiste = CHISTES[Math.floor(Math.random() * CHISTES.length)]
    await reply(`> ʕ•ᴥ•ʔ ${chiste}`)
  }
}
