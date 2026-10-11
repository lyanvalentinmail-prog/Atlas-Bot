// ╭────────────────────────────────────────────
// │  COMANDO » memoria » pares de símbolos 4x4.
// │  Voltea dos casillas por turno: A1 B2
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { MEMORIA_SYMBOLS } from '../../lib/data/texts.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

const filaLetra = 'abcd'

const renderTablero = (game) => {
  const lineas = ['    1   2   3   4']
  for (let f = 0; f < 4; f++) {
    const celdas = []
    for (let c = 0; c < 4; c++) {
      const i = f * 4 + c
      celdas.push(game.encontrados.has(i) || game.volteados.includes(i) ? ` ${game.tablero[i]} ` : ' ◻ ')
    }
    lineas.push(`${filaLetra[f].toUpperCase()} ${celdas.join(' ')}`)
  }
  return '```\n' + lineas.join('\n') + '\n```'
}

export default {
  name: 'memory',
  alias: ['memorama', 'memoriapares', 'memoria'],
  category: 'juegos',
  description: 'Juega a encontrar pares de símbolos.',
  usage: 'memory',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const simbolos = MEMORIA_SYMBOLS.slice(0, 8)
    const tablero = [...simbolos, ...simbolos].sort(() => Math.random() - 0.5)
    const game = {
      name: 'memoria',
      tablero,
      encontrados: new Set(),
      volteados: [],
      turnos: 0,

      async onInput({ body, sender }) {
        const entrada = body.toLowerCase().trim()
        if (entrada === 'salir') {
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Memoria cancelada.' })
          return true
        }

        const m = entrada.match(/^([a-d])([1-4])\s+([a-d])([1-4])$/)
        if (!m) return false

        const i1 = filaLetra.indexOf(m[1]) * 4 + (parseInt(m[2], 10) - 1)
        const i2 = filaLetra.indexOf(m[3]) * 4 + (parseInt(m[4], 10) - 1)

        if (i1 === i2 || game.encontrados.has(i1) || game.encontrados.has(i2)) {
          await sock.sendMessage(chatId, { text: '> Esas casillas no valen. Elige otras.' })
          return true
        }

        game.volteados = [i1, i2]
        game.turnos++

        if (game.tablero[i1] === game.tablero[i2]) {
          game.encontrados.add(i1)
          game.encontrados.add(i2)
          game.volteados = []
          if (game.encontrados.size === 16) {
            endGame(chatId)
            const cuenta = getAccount(sender)
            cuenta.coins += 30; cuenta.exp += 25; saveDatabase()
            await sock.sendMessage(chatId, { text: `${renderTablero(game)}\n> ✯ ¡COMPLETADO en ${game.turnos} turnos! ・ +30 monedas`, })
            return true
          }
          await sock.sendMessage(chatId, { text: `> ✔ Par encontrado: ${game.tablero[i1]}\n${renderTablero(game)}` })
        } else {
          await sock.sendMessage(chatId, { text: `${renderTablero(game)}\n> No coinciden. Memorízalos.` })
          game.volteados = []
        }
        return true
      }
    }

    startGame(chatId, game)
    await reply(`> ◻ MEMORIA 4×4:\n${renderTablero(game)}\n> Voltea dos casillas: *A1 B2* ("salir" para rendirte).`)
  }
}
