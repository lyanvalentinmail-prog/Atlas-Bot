// ╭────────────────────────────────────────────
// │  COMANDO » reglas » muestra las reglas.
// ╰────────────────────────────────────────────
import { getGroupSettings } from '../../lib/database.js'

export default {
  name: 'rules',
  alias: ['normas', 'reglas'],
  category: 'moderacion',
  description: 'Muestra las reglas configuradas del grupo.',
  usage: 'rules',
  groupOnly: true,

  run: async ({ reply, chatId, prefix }) => {
    const settings = getGroupSettings(chatId)
    if (!settings.rules) {
      return reply(`> Este grupo aún no tiene reglas.\n> Un admin las define con: ${prefix}setrules <texto>`)
    }
    await reply(`╭─「 REGLAS DEL GRUPO 」\n╰─────────────\n${settings.rules}`)
  }
}
