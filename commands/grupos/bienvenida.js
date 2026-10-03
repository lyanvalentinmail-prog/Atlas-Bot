// ╭────────────────────────────────────────────
// │  COMANDO » bienvenida
// │  Activa/desactiva el mensaje de bienvenida
// │  automático (solo admins). El evento vive
// │  en lib/connection.js » puedes editar el
// │  texto en config.js (messages.welcome)
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'bienvenida',
  alias: ['welcome', 'bienvenidos'],
  category: 'grupos',
  description: 'Activa/desactiva la bienvenida automática.',
  usage: 'bienvenida on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'on' || opcion === 'off') {
      settings.welcome = opcion === 'on'
      saveDatabase()
      return reply(
        settings.welcome
          ? '> こ Bienvenida *activada*: saludaré a los nuevos miembros.'
          : '> こ Bienvenida *desactivada*.'
      )
    }

    await reply(
      `» Estado actual: ${settings.welcome ? '*activada*' : '*desactivada*'}\n` +
      `» Uso: ${prefix}bienvenida on ・ ${prefix}bienvenida off`
    )
  }
}
