// ╭────────────────────────────────────────────
// │  COMANDO » capitales » ¿capital del país?
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { CAPITALES } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export default {
  name: 'capitals',
  alias: ['capitalquiz', 'capital', 'capitales'],
  category: 'juegos',
  description: 'Adivina la capital de un país.',
  usage: 'capitals',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const elegido = CAPITALES[Math.floor(Math.random() * CAPITALES.length)]
    let intentos = 0

    startGame(chatId, {
      name: 'capitales',
      async onInput({ body, sender }) {
        const entrada = norm(body)
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> La capital de ${elegido.pais} es *${elegido.capital}*.` })
          return true
        }
        if (entrada.length < 3) return false

        if (entrada === norm(elegido.capital)) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 15; cuenta.exp += 12; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡Correcto! La capital de ${elegido.pais} es *${elegido.capital}* ・ +15 monedas` })
          return true
        }

        intentos++
        if (intentos >= 3) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Se acabaron los intentos. Era *${elegido.capital}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: `> No es... (${intentos}/3 intentos)` })
        return true
      }
    })

    await reply(`> ▢ CAPITALES:\n> ¿Cuál es la capital de *${elegido.pais}*?\n> Tienes 3 intentos ("salir" para rendirte).`)
  }
}
