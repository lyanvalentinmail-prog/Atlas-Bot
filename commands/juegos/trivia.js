// ╭────────────────────────────────────────────
// │  COMANDO » trivia » 1 pregunta con opciones.
// │  Responde con el número (1-4) en el chat.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { TRIVIA } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'trivia',
  alias: ['preguntados', 'triviuc'],
  category: 'juegos',
  description: 'Responde preguntas de conocimiento general.',
  usage: 'trivia',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const pregunta = TRIVIA[Math.floor(Math.random() * TRIVIA.length)]

    startGame(chatId, {
      name: 'trivia',
      async onInput({ body, sender }) {
        const entrada = body.toLowerCase().trim()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Trivia cancelada.' })
          return true
        }

        const num = parseInt(entrada, 10)
        if (!/^[1-4]$/.test(entrada) && Number.isNaN(num)) return false

        endGame(chatId)
        if (num - 1 === pregunta.r) {
          const cuenta = getAccount(sender)
          cuenta.coins += 15; cuenta.exp += 10; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡CORRECTO! Era *${pregunta.ops[pregunta.r]}* ・ +15 monedas` })
        } else {
          await sock.sendMessage(chatId, { text: `> No... la correcta era *${pregunta.ops[pregunta.r]}*.` })
        }
        return true
      }
    })

    await reply([
      `> 〇 TRIVIA:`,
      `> *${pregunta.q}*`,
      ...pregunta.ops.map((op, i) => `${i + 1}. ${op}`),
      '> Responde con el número (1-4). "salir" para cancelar.'
    ].join('\n'))
  }
}
