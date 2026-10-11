// ╭────────────────────────────────────────────
// │  COMANDO » 8ball » bola mágica.
// ╰────────────────────────────────────────────
import { BOLA8 } from '../../lib/data/texts.js'

export default {
  name: '8ball',
  alias: ['bolamagica', 'oráculo', 'oraculo'],
  category: 'memes',
  description: 'Responde una pregunta al estilo bola mágica.',
  usage: '8ball <pregunta>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}8ball <pregunta>\n» Ejemplo: ${prefix}8ball ¿apruebo el examen?`)

    const respuesta = BOLA8[Math.floor(Math.random() * BOLA8.length)]
    await reply(`> 〄 La bola dice:\n> *${respuesta}*`)
  }
}
