// ╭────────────────────────────────────────────
// │  COMANDO » pokemonquiz » ¿qué pokémon es?
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { POKEMON_PISTAS } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export default {
  name: 'pokemonquiz',
  alias: ['pokemonadivina', 'adivinapokemon'],
  category: 'juegos',
  description: 'Adivina un Pokémon mediante pistas.',
  usage: 'pokemonquiz',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const elegido = POKEMON_PISTAS[Math.floor(Math.random() * POKEMON_PISTAS.length)]
    let pistaActual = 0

    const mandarPista = async (i) => {
      await sock.sendMessage(chatId, {
        text: `> Pista ${i + 1}/${elegido.pistas.length}:\n> ${elegido.pistas[i]}`
      })
    }

    startGame(chatId, {
      name: 'pokemonquiz',
      async onInput({ body, sender }) {
        const entrada = norm(body)
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Era *${elegido.nombre}*.` })
          return true
        }
        if (entrada.length < 3) return false

        if (entrada === elegido.nombre) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 20; cuenta.exp += 15; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡ES *${elegido.nombre.toUpperCase()}*! ・ +20 monedas` })
          return true
        }

        pistaActual++
        if (pistaActual >= elegido.pistas.length) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Sin más pistas... era *${elegido.nombre}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: '> No es... otra pista:' })
        await mandarPista(pistaActual)
        return true
      }
    })

    await reply('> ◉ POKEMON QUIZ:\n> Adivina el pokémon por pistas ("salir" para rendirte).')
    await mandarPista(0)
  }
}
