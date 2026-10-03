// ╭────────────────────────────────────────────
// │  COMANDO » slot
// │  Tragamonedas. Apuesta monedas y gana:
// │  3 iguales = ×4 apuesta ・ 2 iguales = +seguro
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

const SIMBOLOS = ['♤', '♧', '♡', '♢', '★']

export default {
  name: 'slot',
  alias: ['tragamonedas', 'maquinita', 'slots'],
  category: 'economia',
  description: 'Tragamonedas: apuesta monedas para ganar.',
  usage: 'slot <cantidad>',

  run: async ({ reply, sender, args, prefix }) => {
    const apuesta = Math.abs(Math.floor(Number(args[0])))

    if (!apuesta || apuesta <= 0) {
      return reply(`» Uso: ${prefix}slot <monedas>\n» Ejemplo: ${prefix}slot 50`)
    }

    const cuenta = getAccount(sender)
    if (cuenta.coins < apuesta) {
      return reply(`» Solo tienes ${cuenta.coins} monedas. Usa ${prefix}daily primero.`)
    }

    // Gira los carretes
    const resultado = [
      SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)],
      SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)],
      SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]
    ]

    const [a, b, c] = resultado
    let premio = 0
    let mensaje = ''

    if (a === b && b === c) {
      premio = apuesta * 4
      mensaje = '» ¡TRIPLE! Premio ×4'
    } else if (a === b || b === c || a === c) {
      premio = apuesta // devuelve tu apuesta
      mensaje = '» Par: recuperas tu apuesta.'
    } else {
      premio = 0
      mensaje = '» Nada... suerte la próxima.'
    }

    cuenta.coins = cuenta.coins - apuesta + premio
    saveDatabase()

    await reply([
      `> [ ${a} | ${b} | ${c} ]`,
      `> ${mensaje}`,
      `> Saldo: ${cuenta.coins} monedas`
    ].join('\n'))
  }
}
