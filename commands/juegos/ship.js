// ╭────────────────────────────────────────────
// │  COMANDO » ship
// │  Calcula la "compatibilidad" entre dos
// │  personas (diversión). Basado en hash, así
// │  que el mismo par siempre da lo mismo.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

function compatibilidad(a, b) {
  // Hash determinista: mismo par = mismo resultado
  const clave = [getNumber(a), getNumber(b)].sort().join('|')
  let hash = 0
  for (let i = 0; i < clave.length; i++) {
    hash = (hash * 31 + clave.charCodeAt(i)) >>> 0
  }
  return hash % 101 // 0-100
}

function barra(porcentaje) {
  const llenos = Math.round(porcentaje / 10)
  return '█'.repeat(llenos) + '░'.repeat(10 - llenos)
}

function veredicto(p) {
  if (p >= 90) return '¡Almas gemelas totales! ♡'
  if (p >= 70) return 'Hay mucha química aquí ♡'
  if (p >= 50) return 'Puede funcionar, con esfuerzo.'
  if (p >= 30) return 'Mejor como amigos...'
  return 'Esquivar balas, urgentemente.'
}

export default {
  name: 'ship',
  alias: ['parejas', 'love', 'amor'],
  category: 'juegos',
  description: 'Mide la compatibilidad entre dos personas.',
  usage: 'ship @alguien (o respóndele)',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg)
    if (!target || target === sender) {
      return reply('» Menciona a alguien distinto a ti: *!ship @usuario*')
    }

    const p = compatibilidad(sender, target)
    await reply([
      '> ৎ LOVE-O-GRAM',
      `> @${getNumber(sender)} × @${getNumber(target)}`,
      `> ${barra(p)} ${p}%`,
      `> ${veredicto(p)}`
    ].join('\n'), { mentions: [sender, target] })
  }
}
