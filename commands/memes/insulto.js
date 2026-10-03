// ╭────────────────────────────────────────────
// │  COMANDO » insulto » insulto humorístico
// │  (ligero, sin crueldad real).
// ╰────────────────────────────────────────────
import { INSULTOS } from '../../lib/data/texts.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'insult',
  alias: ['insultarliviano', 'insulto'],
  category: 'memes',
  description: 'Genera un insulto humorístico.',
  usage: 'insult [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const objetivo = getTargetUser(msg)
    const insulto = INSULTOS[Math.floor(Math.random() * INSULTOS.length)]

    if (!objetivo) return reply(`> ${insulto}`)

    await reply(`> @${getNumber(objetivo)}, ${insulto.charAt(0).toLowerCase() + insulto.slice(1)}\n> (es bromita ♡)`, { mentions: [objetivo] })
  }
}
