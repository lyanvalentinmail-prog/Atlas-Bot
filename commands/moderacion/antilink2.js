// ╭────────────────────────────────────────────
// │  COMANDO » antilink2 » modo del anti-enlaces:
// │  borrar » avisar » expulsar » off
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

const MODOS = ['borrar', 'avisar', 'expulsar']

export default {
  name: 'antilink2',
  alias: ['modolink', 'antilink-config'],
  category: 'moderacion',
  description: 'Configura qué hacer cuando se detecta un enlace.',
  usage: 'antilink2 borrar/avisar/expulsar/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'off') {
      settings.antilink2.on = false
      saveDatabase()
      return reply('> こ Anti-link avanzado *desactivado*.')
    }

    if (MODOS.includes(opcion)) {
      settings.antilink2.on = true
      settings.antilink2.mode = opcion
      saveDatabase()
      const accion = { borrar: 'borraré el mensaje', avisar: 'solo avisaré', expulsar: 'borraré y expulsaré' }[opcion]
      return reply(`> こ Anti-link en modo *${opcion}*: ante un enlace de grupo, ${accion}.`)
    }

    await reply(
      `» Modo actual: ${settings.antilink2.on ? `*${settings.antilink2.mode}*` : '*apagado*'}\n` +
      `» Uso: ${prefix}antilink2 <borrar|avisar|expulsar|off>`
    )
  }
}
