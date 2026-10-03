// ╭────────────────────────────────────────────
// │  COMANDO » futbolquiz » preguntas de fútbol.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { FUTBOL_TRIVIA } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'soccerquiz',
  alias: ['futbol', 'quizfutbol', 'futbolquiz'],
  category: 'juegos',
  description: 'Responde preguntas sobre fútbol (racha de 3).',
  usage: 'soccerquiz',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const preguntas = [...FUTBOL_TRIVIA].sort(() => Math.random() - 0.5).slice(0, 3)
    let actual = 0, aciertos = 0

    const pregunta = async (i) => {
      const p = preguntas[i]
      await sock.sendMessage(chatId, {
        text: [`> Pregunta ${i + 1}/3: *${p.q}*`, ...p.ops.map((op, idx) => `${idx + 1}. ${op}`)].join('\n')
      })
    }

    startGame(chatId, {
      name: 'futbolquiz',
      async onInput({ body, sender }) {
        const entrada = body.trim().toLowerCase()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Quiz de fútbol cancelado.' })
          return true
        }
        const num = parseInt(entrada, 10)
        if (!/^[1-4]$/.test(entrada)) return false

        if (num - 1 === preguntas[actual].r) {
          aciertos++
          await sock.sendMessage(chatId, { text: '> ✔ ¡Correcto!' })
        } else {
          await sock.sendMessage(chatId, { text: `> Era *${preguntas[actual].ops[preguntas[actual].r]}*.` })
        }

        actual++
        if (actual >= preguntas.length) {
          endGame(chatId)
          if (aciertos === preguntas.length) {
            const cuenta = getAccount(sender)
            cuenta.coins += 25; cuenta.exp += 20; saveDatabase()
            await sock.sendMessage(chatId, { text: `> ✯ ¡PERFECTO, ${aciertos}/3! ・ +25 monedas` })
          } else {
            await sock.sendMessage(chatId, { text: `> Terminaste con *${aciertos}/3* aciertos.` })
          }
          return true
        }

        await pregunta(actual)
        return true
      }
    })

    await reply('> ⚽ FÚTBOL QUIZ ・ 3 preguntas, responde con el número.')
    await pregunta(0)
  }
}
