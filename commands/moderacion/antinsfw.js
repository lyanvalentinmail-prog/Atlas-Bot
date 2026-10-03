// ╭────────────────────────────────────────────
// │  COMANDO » antinsfw » filtra dominios y
// │  palabras de contenido adulto.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'antinsfw',
  alias: ['nsfwfilter'],
  category: 'moderacion',
  description: 'Bloquea contenido NSFW en el grupo.',
  usage: 'antinsfw on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (opcion === 'on' || opcion === 'off') {
      settings.antinsfw = opcion === 'on'
      saveDatabase()
      return reply(`> こ Anti-NSFW *${settings.antinsfw ? 'activado' : 'desactivado'}*.`)
    }
    await reply(`» Estado: ${settings.antinsfw ? '*activado*' : '*desactivado*'}\n» Uso: ${prefix}antinsfw on/off`)
  }
}
