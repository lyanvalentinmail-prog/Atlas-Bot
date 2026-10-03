// ╭────────────────────────────────────────────
// │  COMANDO » verdad
// │  Preguntas para "verdad o reto".
// ╰────────────────────────────────────────────

const VERDADES = [
  '¿Cuál es la mentira más grande que has dicho?',
  '¿Qué es lo más vergonzoso que te ha pasado?',
  '¿A quién del grupo le darías tu contraseña?',
  '¿Cuál fue tu última búsqueda en Google?',
  '¿Qué hiciste la última vez que lloraste?',
  '¿Te gusta alguien de este grupo?',
  '¿Cuál es tu mayor miedo?',
  '¿Has revisado el teléfono de alguien sin permiso?',
  '¿Qué es lo más raro que has comido?',
  '¿Cuál es tu peor hábito?',
  '¿A quién bloqueaste por última vez y por qué?',
  '¿Qué harías si ganaras la lotería mañana?',
  '¿Cuál es tu peor cita hasta ahora?',
  '¿Qué mentira le dices a tus padres?',
  '¿Cuál fue tu peor nota en el colegio?'
]

export default {
  name: 'verdad',
  alias: ['truth'],
  category: 'juegos',
  description: 'Pregunta aleatoria de "verdad".',
  usage: 'verdad',

  run: async ({ reply }) => {
    const pregunta = VERDADES[Math.floor(Math.random() * VERDADES.length)]
    await reply(`> ☆ V E R D A D :\n> ${pregunta}`)
  }
}
