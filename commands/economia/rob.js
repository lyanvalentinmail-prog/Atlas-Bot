// ╭────────────────────────────────────────────
// │  COMANDO » rob » intenta robarle monedas a
// │  otro usuario (40% éxito; cooldown 15 min).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getTargetUser, getNumber, formatUptime } from '../../lib/utils.js'

export default {
  name: 'rob',
  alias: ['robar', 'asalto'],
  category: 'economia',
  description: 'Intenta robar monedas a otro usuario.',
  usage: 'rob @usuario',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg)
    if (!target || target === sender) {
      return reply(`» Uso: ${prefix}rob @usuario (otro que tú)`)
    }

    const cuenta = getAccount(sender)
    const ahora = Date.now()
    const ESPERA = 15 * 60 * 1000

    if (ahora - cuenta.lastRob < ESPERA) {
      const falta = formatUptime((cuenta.lastRob + ESPERA - ahora) / 1000)
      return reply(`> La policía virtual te vigila. Vuelve en *${falta}*.`)
    }

    const victima = getAccount(target)
    if (victima.coins < 100) return reply('» Ese usuario casi no tiene monedas. Deja al pobre.')

    cuenta.lastRob = ahora

    if (Math.random() < 0.4) {
      const robado = Math.min(victima.coins, 100 + Math.floor(Math.random() * 200))
      victima.coins -= robado
      cuenta.coins += robado
      saveDatabase()
      await reply([
        `> 〄 ¡Robo exitoso!`,
        `> Le quitaste *${robado}* monedas a @${getNumber(target)}.`,
        `> Tu saldo: ${cuenta.coins}`
      ].join('\n'), { mentions: [target] })
    } else {
      const multa = Math.min(cuenta.coins, 150)
      cuenta.coins -= multa
      saveDatabase()
      await reply(`> ✘ Te atraparon robando y pagaste *${multa}* de multa.\n> Tu saldo: ${cuenta.coins}`)
    }
  }
}
