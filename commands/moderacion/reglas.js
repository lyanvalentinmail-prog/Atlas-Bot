// ╭────────────────────────────────────────────
// │  COMANDO » reglas » muestra las reglas
// │  del grupo enmarcadas.
// ╰────────────────────────────────────────────
import { getGroupSettings } from '../../lib/database.js'
import { box, hint } from '../../lib/ui.js'

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
    await reply(box('REGLAS DEL GRUPO',
      settings.rules.split('\n').map(l => `│ ${l}`),
      hint('Cúmplelas › a la tercera advertencia hay expulsión.')))
  }
}
