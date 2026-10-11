// ╭────────────────────────────────────────────
// │  COMANDO » roast » roast divertido.
// ╰────────────────────────────────────────────
import { ROASTS } from '../../lib/data/texts.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'roast',
  alias: ['asado', 'quemado'],
  category: 'memes',
  description: 'Genera un roast divertido.',
  usage: 'roast [@usuario]',

  run: async ({ msg, reply }) => {
    const objetivo = getTargetUser(msg)
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)]

    if (!objetivo) return reply(`> ${roast}`)

    await reply(`> @${getNumber(objetivo)}, ${roast.charAt(0).toLowerCase() + roast.slice(1)}\n> (juego amistoso, claro)`, { mentions: [objetivo] })
  }
}
