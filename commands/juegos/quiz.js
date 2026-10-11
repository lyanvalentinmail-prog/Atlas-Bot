// ╭────────────────────────────────────────────
// │  COMANDO » quiz » 5 preguntas seguidas, ranking.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { TRIVIA } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'quiz',
  alias: ['cuestionario', 'quiz5'],
  category: 'juegos',
  description: 'Inicia un cuestionario de 5 preguntas.',
  usage: 'quiz',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const preguntas = [...TRIVIA].sort(() => Math.random() - 0.5).slice(0, 5)
    const puntajes = new Map() // numero -> aciertos

    const enviarPregunta = async (indice) => {
      const p = preguntas[indice]
      await sock.sendMessage(chatId, {
        text: [
          `> QUIZ · Pregunta ${indice + 1}/5:`,
          `> *${p.q}*`,
          ...p.ops.map((op, i) => `${i + 1}. ${op}`),
          '> Responde con el número.'
        ].join('\n')
      })
    }

    let actual = 0
    startGame(chatId, {
      name: 'quiz',
      async onInput({ body, senderNumber }) {
        const entrada = body.trim().toLowerCase()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Quiz cancelado.' })
          return true
        }
        const num = parseInt(entrada, 10)
        if (!/^[1-4]$/.test(entrada)) return false

        if (num - 1 === preguntas[actual].r) {
          puntajes.set(senderNumber, (puntajes.get(senderNumber) || 0) + 1)
          await sock.sendMessage(chatId, { text: `> ✯ Correcto, @${senderNumber}!`, mentions: [`${senderNumber}@s.whatsapp.net`] })
        } else {
          await sock.sendMessage(chatId, { text: `> Era *${preguntas[actual].ops[preguntas[actual].r]}*.` })
        }

        actual++
        if (actual >= preguntas.length) {
          endGame(chatId)
          if (puntajes.size === 0) {
            await sock.sendMessage(chatId, { text: '> Quiz terminado sin aciertos... otra vez será.' })
          } else {
            const ranking = [...puntajes.entries()].sort((a, b) => b[1] - a[1])
            const ganador = ranking[0]
            const cuenta = getAccount(`${ganador[0]}@s.whatsapp.net`)
            cuenta.coins += 40; cuenta.exp += 30; saveDatabase()
            await sock.sendMessage(chatId, {
              text: [
                '> ✯ QUIZ TERMINADO',
                ...ranking.map(([n, puntos], i) => `${i + 1}. @${n} » ${puntos}/5`),
                `> Ganador: @${ganador[0]} ・ +40 monedas ・ +30 exp`
              ].join('\n'),
              mentions: ranking.map(([n]) => `${n}@s.whatsapp.net`)
            })
          }
          return true
        }

        await enviarPregunta(actual)
        return true
      }
    })

    await reply('> ✧ QUIZ DE 5 PREGUNTAS ・ ¡que gane el mejor!\n> ("salir" para cancelar)')
    await enviarPregunta(0)
  }
}
