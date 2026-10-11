// ╭────────────────────────────────────────────
// │  COMANDO » ahorcado » juego clásico con 6 vidas.
// │  Escribe letras (o la palabra completa) en el chat.
// │  Escribe "salir" para abandonar.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { PALABRAS, AHORCADO_FIGURA } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const render = (game) => {
  const visible = [...game.word].map(l => game.guessed.has(l) ? l : '▢').join(' ')
  return [
    AHORCADO_FIGURA[game.fails],
    `Palabra: *${visible}*`,
    game.used.length ? `Usadas: ${game.used.join(', ')}` : '',
    `Vidas restantes: *${6 - game.fails}*`
  ].filter(Boolean).join('\n')
}

export default {
  name: 'hangman',
  alias: ['ahorc', 'ahorcado'],
  category: 'juegos',
  description: 'Juega al clásico juego del ahorcado.',
  usage: 'hangman',

  run: async ({ sock, chatId, reply, sender, config }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo en este chat. Espera o escribe "salir".')

    const word = norm(PALABRAS[Math.floor(Math.random() * PALABRAS.length)])
    const game = {
      name: 'ahorcado',
      word,
      guessed: new Set(),
      used: [],
      fails: 0,

      async onInput({ body, sender }) {
        const entrada = norm(body)

        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Juego terminado. La palabra era *${word}*.` })
          return true
        }

        // Palabra completa
        if (entrada === word) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 20; cuenta.exp += 15; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡CORRECTO! La palabra era *${word}*.\n> +20 monedas ・ +15 exp` })
          return true
        }

        // Una sola letra
        if (/^[a-zñ]$/.test(entrada)) {
          if (game.used.includes(entrada)) {
            await sock.sendMessage(chatId, { text: `> Ya probaste la *${entrada}*.` })
            return true
          }
          game.used.push(entrada)
          if (word.includes(entrada)) {
            game.guessed.add(entrada)
            if ([...word].every(l => game.guessed.has(l))) {
              endGame(chatId)
              const cuenta = getAccount(sender)
              cuenta.coins += 20; cuenta.exp += 15; saveDatabase()
              await sock.sendMessage(chatId, { text: `${render(game)}\n\n> ✯ ¡GANASTE! Era *${word}* ・ +20 monedas` })
              return true
            }
          } else {
            game.fails++
            if (game.fails >= 6) {
              endGame(chatId)
              await sock.sendMessage(chatId, { text: `${AHORCADO_FIGURA[6]}\n> Perdiste... la palabra era *${word}*.` })
              return true
            }
          }
          await sock.sendMessage(chatId, { text: render(game) })
          return true
        }

        return false // cualquier otro texto: no es del juego
      }
    }

    startGame(chatId, game)
    await reply(`> ⌂ AHORCADO iniciado:\n\n${render(game)}\n\n> Escribe una *letra* o intenta la *palabra completa*. Escribe "salir" para rendirte.`)
  }
}
