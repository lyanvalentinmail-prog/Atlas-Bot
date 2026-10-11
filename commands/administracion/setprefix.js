// ╭────────────────────────────────────────────
// │  COMANDO » setprefix » prefijo por grupo.
// │  Cada carácter del texto cuenta como prefijo.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'setprefix',
  alias: ['prefijogrupo'],
  category: 'administracion',
  description: 'Cambia el prefijo utilizado por el bot en este grupo.',
  usage: 'setprefix <símbolos> | setprefix reset',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, text, config }) => {
    const settings = getGroupSettings(chatId)

    if (!text) {
      return reply(
        `» Prefijo del grupo: ${settings.groupPrefix ? `*${settings.groupPrefix}*` : '(el global)'}\n` +
        `» Global del bot: *${config.prefix}*\n` +
        `» Uso: setprefix ./! ・ setprefix reset`
      )
    }

    if (text.toLowerCase() === 'reset') {
      settings.groupPrefix = ''
      saveDatabase()
      return reply('> こ Este grupo vuelve a usar el prefijo global.')
    }

    const limpio = text.replace(/\s/g, '').slice(0, 4)
    if (!limpio || /^[a-z0-9]+$/i.test(limpio)) {
      return reply('» El prefijo debe ser de 1 a 4 *símbolos* (no letras ni números).')
    }

    settings.groupPrefix = limpio
    saveDatabase()
    await reply(`> こ Prefijo del grupo: *${limpio}* (cada carácter funciona. El global también sigue sirviendo).`)
  }
}
