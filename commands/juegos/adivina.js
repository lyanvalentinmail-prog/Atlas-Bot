// ╭────────────────────────────────────────────
// │  COMANDO » adivina » palabra secreta con pista.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { ADIVINA_PISTAS } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default {
  name: 'guess',
  alias: ['adivinanza', 'secretword', 'adivina'],
  category: 'juegos',
  description: 'Adivina la palabra secreta con una pista.',
  usage: 'guess',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const elegido = ADIVINA_PISTAS[Math.floor(Math.random() * ADIVINA_PISTAS.length)]
    let intentos = 0

    startGame(chatId, {
      name: 'adivina',
      async onInput({ body, sender }) {
        const entrada = norm(body)
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Era *${elegido.palabra}*.` })
          return true
        }

        if (/\s/.test(entrada) || entrada.length < 2) return false // solo palabras sueltas

        // Acepta con/sin acentos (pista puede tener tilde)
        if (entrada === norm(elegido.palabra)) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 15; cuenta.exp += 10; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡ES *${elegido.palabra}*! Adivinaste en ${intentos + 1} intento(s) ・ +15 monedas` })
          return true
        }

        intentos++
        if (intentos >= 6) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Se acabaron los intentos. Era *${elegido.palabra}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: `> No es *${entrada}*... (${intentos}/6 intentos)` })
        return true
      }
    })

    await reply(`> ᾀ ADIVINA LA PALABRA:\n> Pista: *${elegido.pista}*\n> Tienes 6 intentos. Escribe la palabra ("salir" para rendirte).`)
  }
}
