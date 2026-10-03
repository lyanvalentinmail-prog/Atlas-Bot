// ╭────────────────────────────────────────────
// │  COMANDO » verdadero » V/F con puntuación.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { VERDADERO_FALSO } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const esVerdaderoTxt = (t) => ['verdadero', 'v', 'true', 'si', 'sí'].includes(t)
const esFalsoTxt = (t) => ['falso', 'f', 'false', 'no'].includes(t)

export default {
  name: 'truefalse',
  alias: ['verdaderofalso', 'vf', 'verdadero'],
  category: 'juegos',
  description: 'Decide si una afirmación es verdadera o falsa.',
  usage: 'truefalse',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const rondas = [...VERDADERO_FALSO].sort(() => Math.random() - 0.5).slice(0, 5)
    let actual = 0, aciertos = 0, jugador = null

    const pregunta = async (i) => {
      await sock.sendMessage(chatId, {
        text: `> ${i + 1}/5: *${rondas[i].afirm}*\n> ¿verdadero o falso?`
      })
    }

    startGame(chatId, {
      name: 'verdadero',
      async onInput({ body, sender }) {
        const entrada = body.trim().toLowerCase()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Verdadero/Falso cancelado.' })
          return true
        }
        if (!esVerdaderoTxt(entrada) && !esFalsoTxt(entrada)) return false

        jugador = sender
        const dijoVerdadero = esVerdaderoTxt(entrada)
        if (dijoVerdadero === rondas[actual].r) {
          aciertos++
          await sock.sendMessage(chatId, { text: '> ✔ ¡Exacto!' })
        } else {
          await sock.sendMessage(chatId, { text: `> Era *${rondas[actual].r ? 'VERDADERO' : 'FALSO'}*.` })
        }

        actual++
        if (actual >= rondas.length) {
          endGame(chatId)
          if (aciertos >= 4) {
            const cuenta = getAccount(jugador)
            cuenta.coins += 20; cuenta.exp += 15; saveDatabase()
            await sock.sendMessage(chatId, { text: `> ✯ *${aciertos}/5* ・ +20 monedas` })
          } else {
            await sock.sendMessage(chatId, { text: `> Resultado: *${aciertos}/5*.` })
          }
          return true
        }

        await pregunta(actual)
        return true
      }
    })

    await reply('> ✔✘ VERDADERO O FALSO ・ 5 afirmaciones.')
    await pregunta(0)
  }
}
