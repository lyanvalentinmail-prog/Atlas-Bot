// ╭────────────────────────────────────────────
// │  COMANDO » work » trabaja y gana monedas
// │  (cooldown de 10 minutos).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { formatUptime } from '../../lib/utils.js'

const TRABAJOS = [
  ['Ayudante de tienda', 40, 120],
  ['Repartidor', 50, 150],
  ['Programador novato', 90, 220],
  ['Cuidador de gatos', 45, 130],
  ['Fotógrafo freelance', 80, 200],
  ['Profesor particular', 70, 180],
  ['Cocinero de fondas', 55, 140],
  ['Editor de videos', 85, 210]
]

export default {
  name: 'work',
  alias: ['trabajar', 'chamba'],
  category: 'economia',
  description: 'Trabaja para ganar monedas virtuales.',
  usage: 'work',

  run: async ({ reply, sender, config }) => {
    const cuenta = getAccount(sender)
    const ahora = Date.now()
    const ESPERA = 10 * 60 * 1000

    if (ahora - cuenta.lastWork < ESPERA) {
      const falta = formatUptime((cuenta.lastWork + ESPERA - ahora) / 1000)
      return reply(`> Estás cansado del trabajo. Vuelve en *${falta}*.`)
    }

    const [trabajo, min, max] = TRABAJOS[Math.floor(Math.random() * TRABAJOS.length)]
    const ganancia = min + Math.floor(Math.random() * (max - min))

    cuenta.lastWork = ahora
    cuenta.coins += ganancia
    cuenta.exp += 8
    saveDatabase()

    await reply([
      '> ⛏ TRABAJO COMPLETO:',
      `> Trabajaste de *${trabajo}* y ganaste *${ganancia}* monedas.`,
      `> Saldo: ${cuenta.coins} ・ Exp +8`
    ].join('\n'))
  }
}
