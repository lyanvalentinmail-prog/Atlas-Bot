// ╭────────────────────────────────────────────
// │  COMANDO » reaccion » prueba tus reflejos:
// │  apunta el símbolo apenas aparezca.
// ╰────────────────────────────────────────────
import { startGame, getGame, endGame } from '../../lib/games.js'
import { REACCION_SIMBOLOS } from '../../lib/data/texts.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'reaccion',
  alias: ['reflejos', 'rapidin'],
  category: 'juegos',
  description: 'Pon a prueba tus reflejos con una respuesta rápida.',
  usage: 'reaccion',

  run: async ({ sock, chatId, reply }) => {
    if (getGame(chatId)) return reply('» Ya hay un juego activo. Espera o escribe "salir".')

    const simbolo = REACCION_SIMBOLOS[Math.floor(Math.random() * REACCION_SIMBOLOS.length)]
    const espera = 3000 + Math.floor(Math.random() * 4000) // 3 a 7 segundos

    let estado = 'preparando'
    let listoEn = 0
    let timer = null

    startGame(chatId, {
      name: 'reaccion',
      async onInput({ body, sender, senderNumber }) {
        const entrada = body.trim()

        if (entrada.toLowerCase() === 'salir') {
          clearTimeout(timer)
          endGame(chatId)
          await sock.sendMessage(chatId, { text: '> Juego de reacción cancelado.' })
          return true
        }

        if (estado === 'preparando') {
          if (entrada.includes(simbolo) || entrada.length <= 3) {
            await sock.sendMessage(chatId, {
              text: `> @${senderNumber} ¡muy pronto! Espera a que salga el símbolo.`,
              mentions: [`${senderNumber}@s.whatsapp.net`]
            })
            return true
          }
          return false
        }

        // Ya salió el símbolo
        if (entrada.includes(simbolo)) {
          if (timer) clearTimeout(timer)
          endGame(chatId)

          const ms = Date.now() - listoEn
          const cuenta = getAccount(sender)
          cuenta.coins += 25; cuenta.exp += 20; saveDatabase()

          await sock.sendMessage(chatId, {
            text: `> ✯ @${senderNumber} ganó en *${ms} ms* ・ +25 monedas`,
            mentions: [`${senderNumber}@s.whatsapp.net`]
          })
          return true
        }

        return true // cualquier otra entrada una vez lanzado: la ignora el juego
      }
    })

    await reply(`> っ REACCIÓN:\n> Cuando aparezca el símbolo, escríbelo ¡lo más rápido posible!\n> El primero gana. ("salir" para cancelar)`)

    timer = setTimeout(async () => {
      estado = 'listo'
      listoEn = Date.now()
      await sock.sendMessage(chatId, { text: `> ✯ ESCRIBE: *${simbolo}* *${simbolo}* *${simbolo}*` }).catch(() => null)
    }, espera)
    timer.unref?.()
  }
}
