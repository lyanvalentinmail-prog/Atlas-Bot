// ╭────────────────────────────────────────────
// │  COMANDO » setwelcome » bienvenida a medida.
// │  Usa {user} donde quieras la mención.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'setwelcome',
  alias: ['bienvenidapersonal'],
  category: 'administracion',
  description: 'Personaliza el mensaje de bienvenida.',
  usage: 'setwelcome <texto con {user}>',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, text, prefix }) => {
    const settings = getGroupSettings(chatId)

    if (!text) {
      return reply(
        `» Uso: ${prefix}setwelcome <texto> ・ {user} menciona al nuevo\n` +
        `» Ejemplo: ${prefix}setwelcome ¡Hola {user}! Bienvenido al mejor grupo.\n` +
        `» Quitar personalización: ${prefix}setwelcome reset`
      )
    }

    if (text.toLowerCase() === 'reset') {
      settings.customWelcome = ''
      saveDatabase()
      return reply('> こ Bienvenida personalizada eliminada (vuelve la por defecto).')
    }

    settings.customWelcome = text.slice(0, 800)
    if (!text.includes('{user}')) {
      return reply('» Tu texto no tiene *{user}*. Sin mención no es bienvenida útil:\n> Escríbelo de nuevo incluyendo {user}')
    }
    saveDatabase()
    await reply('> こ Bienvenida personalizada guardada. Recuerda activarla con: !bienvenida on')
  }
}
