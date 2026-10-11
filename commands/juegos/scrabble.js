// ╭────────────────────────────────────────────
// │  COMANDO » scrabble » forma palabras válidas.
// │  5 rondas de letras; palabra más larga gana.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { DICCIONARIO } from '../../lib/data/quiz.js'
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'

const VOCALES = 'aeiou'
const CONSONANTES = 'bcdfghjklmnprstvw'
const nuevaTanda = () => {
  const letras = []
  for (let i = 0; i < 5; i++) letras.push(CONSONANTES[Math.floor(Math.random() * CONSONANTES.length)])
  for (let i = 0; i < 3; i++) letras.push(VOCALES[Math.floor(Math.random() * VOCALES.length)])
  return letras.sort(() => Math.random() - 0.5)
}

const sePuedeFormar = (palabra, letras) => {
  const copia = [...letras]
  for (const letra of palabra) {
    const i = copia.indexOf(letra)
    if (i === -1) return false
    copia.splice(i, 1)
  }
  return true
}

export default {
  name: 'scrabble',
  alias: ['palabrasazo', 'scrab'],
  category: 'juegos',
  description: 'Forma palabras con letras aleatorias.',
  usage: 'scrabble',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    let ronda = 1
    let letras = nuevaTanda()
    const puntajes = new Map()

    startGame(chatId, {
      name: 'scrabble',
      async onInput({ body, sender, senderNumber }) {
        const entrada = body.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Scrabble cancelado.' })
          return true
        }

        if (!/^[a-z]{3,}$/.test(entrada)) return false

        if (!sePuedeFormar(entrada, letras)) {
          await sock.sendMessage(chatId, { text: `> No se puede formar *${entrada}* con esas letras.` })
          return true
        }
        if (!DICCIONARIO.includes(entrada)) {
          await sock.sendMessage(chatId, { text: `> *${entrada}* no está en mi diccionario.` })
          return true
        }

        const puntos = entrada.length
        puntajes.set(senderNumber, (puntajes.get(senderNumber) || 0) + puntos)
        await sock.sendMessage(chatId, { text: `> ✔ *${entrada}* vale ${puntos} pts. Total: ${puntajes.get(senderNumber)}` })

        ronda++
        if (ronda > 5) {
          endGame(chatId)
          const ranking = [...puntajes.entries()].sort((a, b) => b[1] - a[1])
          if (ranking.length) {
            const cuenta = getAccount(`${ranking[0][0]}@s.whatsapp.net`)
            cuenta.coins += 30; cuenta.exp += 25; saveDatabase()
            await sock.sendMessage(chatId, {
              text: [
                '> ✯ SCRABBLE TERMINADO',
                ...ranking.map(([n, puntos], i) => `${i + 1}. @${n} » ${puntos} pts`),
                `> Ganador: @${ranking[0][0]} ・ +30 monedas`
              ].join('\n'),
              mentions: ranking.map(([n]) => `${n}@s.whatsapp.net`)
            })
          }
          return true
        }

        letras = nuevaTanda()
        await sock.sendMessage(chatId, { text: `> Ronda ${ronda}/5 ・ Letras: *${letras.join(' ')}*` })
        return true
      }
    })

    await reply(`> ✄ SCRABBLE (5 rondas):\n> Letras: *${letras.join(' ')}*\n> Forma una palabra de 3+ letras ("salir" para cancelar).`)
  }
}
