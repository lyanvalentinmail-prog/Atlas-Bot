// ╭────────────────────────────────────────────
// │  COMANDO » horoscopo » horóscopo diario
// │  (texto rotativo por signo y día).
// ╰────────────────────────────────────────────
import { HOROSCOPOS } from '../../lib/data/texts.js'

export default {
  name: 'horoscopo',
  alias: ['horoscop', 'signo'],
  category: 'memes',
  description: 'Muestra un horóscopo diario.',
  usage: 'horoscopo <signo>',

  run: async ({ reply, args, prefix }) => {
    const signo = (args[0] || '').toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e')
    const texto = HOROSCOPOS[signo]

    if (!texto) {
      const lista = Object.keys(HOROSCOPOS).join(', ')
      return reply(`» Uso: ${prefix}horoscopo <signo>\n» Signos: ${lista}`)
    }

    await reply(`> ✯ *${signo.charAt(0).toUpperCase() + signo.slice(1)}*:\n> ${texto}`)
  }
}
