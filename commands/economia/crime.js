// ╭────────────────────────────────────────────
// │  COMANDO » crime » apuesta ficticia de riesgo
// │  (cooldown de 20 minutos).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { formatUptime } from '../../lib/utils.js'

const EXITOS = [
  ['Lograste vender tus colecciones raras', 250, 500],
  ['Tu jugada maestra salió perfecta', 300, 600],
  ['El plan salió redondo', 200, 450]
]

const FRACASOS = [
  ['La suerte no te acompañó y perdiste monedas', 150, 350],
  ['Te descubrieron y pagaste la multa', 200, 400],
  ['Plan fallido; tuviste que compensar', 100, 300]
]

export default {
  name: 'crime',
  alias: ['crimenfake', 'riesgo'],
  category: 'economia',
  description: 'Arriesga monedas en una actividad ficticia.',
  usage: 'crime',

  run: async ({ reply, sender }) => {
    const cuenta = getAccount(sender)
    const ahora = Date.now()
    const ESPERA = 20 * 60 * 1000

    if (ahora - cuenta.lastCrime < ESPERA) {
      const falta = formatUptime((cuenta.lastCrime + ESPERA - ahora) / 1000)
      return reply(`> Aún te da miedo intentar. Vuelve en *${falta}*.`)
    }

    if (cuenta.coins < 100) return reply('» Necesitas al menos 100 monedas para arriesgar.')

    cuenta.lastCrime = ahora

    if (Math.random() < 0.55) {
      const [texto, min, max] = EXITOS[Math.floor(Math.random() * EXITOS.length)]
      const ganancia = min + Math.floor(Math.random() * (max - min))
      cuenta.coins += ganancia
      cuenta.exp += 12
      saveDatabase()
      await reply(`> 〄 ${texto}: *+${ganancia}* monedas.\n> Saldo: ${cuenta.coins}`)
    } else {
      const [texto, min, max] = FRACASOS[Math.floor(Math.random() * FRACASOS.length)]
      const perdida = Math.min(cuenta.coins, min + Math.floor(Math.random() * (max - min)))
      cuenta.coins -= perdida
      saveDatabase()
      await reply(`> 〄 ${texto}: *-${perdida}* monedas.\n> Saldo: ${cuenta.coins}\n> (todo ficticio, claro)`)
    }
  }
}
