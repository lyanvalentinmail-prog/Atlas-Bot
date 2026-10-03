// ╭────────────────────────────────────────────
// │  COMANDO » anagrama » desordena y resuelve.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { DICCIONARIO } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default {
  name: 'anagram',
  alias: ['desorden', 'anagrama'],
  category: 'juegos',
  description: 'Resuelve un anagrama.',
  usage: 'anagram',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const palabra = DICCIONARIO.filter(p => p.length >= 4)[Math.floor(Math.random() * DICCIONARIO.filter(p => p.length >= 4).length)]
    const revuelta = [...palabra].sort(() => Math.random() - 0.5).join('')
    let fallos = 0

    startGame(chatId, {
      name: 'anagrama',
      async onInput({ body, sender }) {
        const entrada = norm(body)
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Era *${palabra.toUpperCase()}*.` })
          return true
        }
        if (/\s/.test(entrada) || entrada.length < 3) return false

        if (entrada === palabra) {
          endGame(chatId)
          const cuenta = getAccount(sender)
          cuenta.coins += 15; cuenta.exp += 12; saveDatabase()
          await sock.sendMessage(chatId, { text: `> ✯ ¡*${palabra.toUpperCase()}*! ・ +15 monedas` })
          return true
        }

        fallos++
        if (fallos >= 5) {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: `> Se acabaron los intentos. Era *${palabra.toUpperCase()}*.` })
          return true
        }
        await sock.sendMessage(chatId, { text: `> No es... (${fallos}/5)\n> Letras: *${revuelta.toUpperCase()}*` })
        return true
      }
    })

    await reply(`> ⇋ ANAGRAMA:\n> Desordena estas letras: *${revuelta.toUpperCase()}*\n> Tienes 5 intentos ("salir" para rendirte).`)
  }
}
