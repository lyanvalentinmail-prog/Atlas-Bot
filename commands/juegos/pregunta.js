// ╭────────────────────────────────────────────
// │  COMANDO » pregunta
// │  El bot responde tu pregunta al azar
// │  (estilo bola mágica).
// ╰────────────────────────────────────────────

const ANSWERS = [
  'Sí, definitivamente.',
  'Sí, pero no como esperas.',
  'Es muy probable.',
  'No lo creo.',
  'Definitivamente no.',
  'Mejor pregúntame luego.',
  'Las señales dicen que sí.',
  'Las señales dicen que no.',
  'Depende totalmente de ti.',
  'Ni lo sueñes.',
  'Cien por ciento sí.',
  'Mejor no te lo digo...'
]

export default {
  name: 'question',
  alias: ['dime', 'pregunta8', 'pregunta'],
  category: 'juegos',
  description: 'El bot responde tu pregunta al azar.',
  usage: 'question <tu pregunta>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}question <tu pregunta>`)
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
    await reply(`> Pregunta: _${text}_\n> Respuesta: *${answer}*`)
  }
}
