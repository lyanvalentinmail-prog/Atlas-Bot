// ╭────────────────────────────────────────────
// │  COMANDO » numero » adivina el número 1-100.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'number',
  alias: ['adivinanumero', 'num', 'numero'],
  category: 'juegos',
  description: 'Adivina el número elegido por el bot (1-100).',
  usage: 'number',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const secreto = Math.floor(Math.random() * 100) + 1
    let intentos = 0

    startGame(chatId, {
      name: 'numero',
      async onInput({ body, sender }) {
        const entrada = body.trim().toLowerCase()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Era el *${secreto}*.` })
          return true
        }

        const num = parseInt(entrada, 10)
        if (!/^\d{1,3}$/.test(entrada)) return false

        intentos++
        if (num === secreto) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 20; cuenta.exp += 15; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡EL *${secreto}*! En ${intentos} intento(s) ・ +20 monedas` })
          return true
        }
        if (intentos >= 8) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Se acabaron los intentos. Era el *${secreto}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: `> ${num < secreto ? 'Más alto ▲' : 'Más bajo ▼'} (${intentos}/8)` })
        return true
      }
    })

    await reply('> ४ NÚMERO SECRETO:\n> Pensé un número del *1 al 100*. Tienes 8 intentos.\n> Escribe tu número ("salir" para rendirte).')
  }
}
