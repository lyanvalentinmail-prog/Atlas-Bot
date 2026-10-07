// ╭────────────────────────────────────────────
// │  COMANDO » resetgrupo » ajustes de fábrica.
// ╰────────────────────────────────────────────
import { resetGroupSettings } from '../../lib/database.js'

export default {
  name: 'resetgroup',
  alias: ['reiniciargrupo', 'resetgrupo'],
  category: 'administracion',
  description: 'Restablece la configuración del grupo.',
  usage: 'resetgroup',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId }) => {
    resetGroupSettings(chatId)
    await reply('> こ Configuración del grupo *restablecida*: antilink, bienvenida, silencios, advertencias, reglas y prefijo limpios.')
  }
}
