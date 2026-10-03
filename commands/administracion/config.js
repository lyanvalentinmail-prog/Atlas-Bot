// ╭────────────────────────────────────────────
// │  COMANDO » config » resumen de ajustes.
// ╰────────────────────────────────────────────
import { getGroupSettings } from '../../lib/database.js'

const onoff = (v) => (v ? 'on' : 'off')

export default {
  name: 'config',
  alias: ['configgrupo', 'ajustes'],
  category: 'administracion',
  description: 'Muestra la configuración actual del grupo.',
  usage: 'config',
  groupOnly: true,

  run: async ({ reply, chatId }) => {
    const s = getGroupSettings(chatId)
    const silencio = s.mutedChat === -1 ? 'indefinido' : (s.mutedChat > Date.now() ? 'temporal' : 'no')

    await reply([
      '╭─「 CONFIG DEL GRUPO 」',
      `│ » Anti-link      : ${onoff(s.antilink)}${s.antilink2.on ? ` (${s.antilink2.mode})` : ''}`,
      `│ » Bienvenida     : ${onoff(s.welcome)}${s.customWelcome ? ' (personalizada)' : ''}`,
      `│ » Anti-spam      : ${onoff(s.antispam)}`,
      `│ » Anti-flood     : ${onoff(s.antiflood)}`,
      `│ » Anti-bot       : ${onoff(s.antibot)}`,
      `│ » Anti-NSFW      : ${onoff(s.antinsfw)}`,
      `│ » Chat silenciado: ${silencio}`,
      `│ » Silenciados    : ${s.muted.length}`,
      `│ » Vetados        : ${s.banned.length}`,
      `│ » Solo-admins    : ${s.soloAdmins.length ? s.soloAdmins.join(', ') : 'ninguno'}`,
      `│ » Prefijo extra  : ${s.groupPrefix || '(ninguno)'}`,
      `│ » Reglas         : ${s.rules ? 'definidas' : 'sin definir'}`,
      '╰─────────────'
    ].join('\n'))
  }
}
