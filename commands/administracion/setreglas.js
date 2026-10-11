// ╭────────────────────────────────────────────
// │  COMANDO » setreglas » define las reglas.
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'setrules',
  alias: ['ponerreglas', 'establecerreglas', 'setreglas'],
  category: 'administracion',
  description: 'Establece las reglas del grupo.',
  usage: 'setrules <texto>',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}setrules <reglas del grupo>`)

    const settings = getGroupSettings(chatId)
    settings.rules = text.slice(0, 1200)
    saveDatabase()
    await reply(`> こ Reglas del grupo actualizadas. Todos las ven con ${prefix}rules`)
  }
}
