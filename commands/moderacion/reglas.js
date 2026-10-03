// ╭────────────────────────────────────────────
// │  COMANDO » reglas » muestra las reglas.
// ╰────────────────────────────────────────────
import { getGroupSettings } from '../../lib/database.js'

export default {
  name: 'reglas',
  alias: ['rules', 'normas'],
  category: 'moderacion',
  description: 'Muestra las reglas configuradas del grupo.',
  usage: 'reglas',
  groupOnly: true,

  run: async ({ reply, chatId, prefix }) => {
    const settings = getGroupSettings(chatId)
    if (!settings.rules) {
      return reply(`> Este grupo aún no tiene reglas.\n> Un admin las define con: ${prefix}setreglas <texto>`)
    }
    await reply(`╭─「 REGLAS DEL GRUPO 」\n╰─────────────\n${settings.rules}`)
  }
}
