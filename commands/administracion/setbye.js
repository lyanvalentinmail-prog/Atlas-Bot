// ╭────────────────────────────────────────────
// │  COMANDO » setbye » despedida a medida.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'setbye',
  alias: ['despedidapersonal'],
  category: 'administracion',
  description: 'Personaliza el mensaje de despedida.',
  usage: 'setbye <texto con {user}>',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, text, prefix }) => {
    const settings = getGroupSettings(chatId)

    if (!text) {
      return reply(
        `» Uso: ${prefix}setbye <texto> ・ {user} menciona al que se va\n` +
        `» Ejemplo: ${prefix}setbye Adiós {user}, te extrañaremos.\n` +
        `» Quitar personalización: ${prefix}setbye reset`
      )
    }

    if (text.toLowerCase() === 'reset') {
      settings.customBye = ''
      saveDatabase()
      return reply('> こ Despedida personalizada eliminada.')
    }

    settings.customBye = text.slice(0, 800)
    saveDatabase()
    await reply('> こ Despedida personalizada guardada.')
  }
}
