// ╭────────────────────────────────────────────
// │  COMANDO » banderas » adivina el país por
// │  la descripción de colores (sin emojis).
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { BANDERAS } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export default {
  name: 'banderas',
  alias: ['bandera', 'flagquiz'],
  category: 'juegos',
  description: 'Adivina el país de una bandera descrita.',
  usage: 'banderas',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const elegido = BANDERAS[Math.floor(Math.random() * BANDERAS.length)]
    let intentos = 0

    startGame(chatId, {
      name: 'banderas',
      async onInput({ body, sender }) {
        const entrada = norm(body)
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Era *${elegido.pais}*.` })
          return true
        }
        if (entrada.length < 3) return false

        if (entrada === norm(elegido.pais)) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 15; cuenta.exp += 12; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡*${elegido.pais.toUpperCase()}* correcto! ・ +15 monedas` })
          return true
        }

        intentos++
        if (intentos >= 3) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Se acabaron los intentos. Era *${elegido.pais}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: `> No es ese país... (${intentos}/3)` })
        return true
      }
    })

    await reply(`> ⚑ BANDERAS (versión texto):\n> ${elegido.desc}\n> ¿De qué país es? ("salir" para rendirte)`)
  }
}
