// ╭────────────────────────────────────────────
// │  COMANDO » config » resumen de ajustes
// │  del grupo con marcas ✔/✘.
// ╰────────────────────────────────────────────
import { getGroupSettings } from '../../lib/database.js'
import { box, kv, hint, flag } from '../../lib/ui.js'

export default {
  name: 'config',
  alias: ['configgrupo', 'ajustes'],
  category: 'administracion',
  description: 'Muestra la configuración actual del grupo.',
  usage: 'config',
  groupOnly: true,

  run: async ({ reply, chatId, prefix }) => {
    const s = getGroupSettings(chatId)
    const silencio = s.mutedChat === -1
      ? 'indefinido'
      : (s.mutedChat > Date.now() ? 'temporal' : flag(false))

    await reply(box('CONFIG DEL GRUPO', [
      kv('Anti-link', `${flag(s.antilink)}${s.antilink2.on ? ` › ${s.antilink2.mode}` : ''}`),
      kv('Bienvenida', `${flag(s.welcome)}${s.customWelcome ? ' › personalizada' : ''}`),
      kv('Anti-spam', flag(s.antispam)),
      kv('Anti-flood', flag(s.antiflood)),
      kv('Anti-bot', flag(s.antibot)),
      kv('Anti-NSFW', flag(s.antinsfw)),
      kv('Chat silenciado', silencio),
      '│─────────────',
      kv('Silenciados', `${s.muted.length}`),
      kv('Vetados', `${s.banned.length}`),
      kv('Solo-admins', s.soloAdmins.length ? s.soloAdmins.join(', ') : 'ninguno'),
      kv('Prefijo extra', s.groupPrefix || '(ninguno)'),
      kv('Reglas', s.rules ? 'definidas ✔' : 'sin definir ✘')
    ], hint(`Cambia opciones con ${prefix}settings`)))
  }
}
