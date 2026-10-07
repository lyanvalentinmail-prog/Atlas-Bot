// ╭────────────────────────────────────────────
// │  COMANDO » warnings » ver advertencias
// │  con barra de riesgo.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings } from '../../lib/database.js'
import { WARN_LIMIT } from './warn.js'
import { box, kv, bar } from '../../lib/ui.js'

export default {
  name: 'warnings',
  alias: ['warns', 'advertencias'],
  category: 'moderacion',
  description: 'Muestra las advertencias de un usuario.',
  usage: 'warnings [@usuario]',
  groupOnly: true,

  run: async ({ msg, reply, chatId, sender }) => {
    const target = getTargetUser(msg) || sender
    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    const cuenta = settings.warns[number] || 0

    await reply(box('ADVERTENCIAS', [
      kv('Usuario', `@${number}`),
      kv('Conteo', `*${cuenta}/${WARN_LIMIT}*`),
      `│ ${bar(cuenta, WARN_LIMIT, WARN_LIMIT * 4)}`,
      kv('Riesgo', cuenta >= WARN_LIMIT
        ? 'expulsión pendiente ⛔'
        : cuenta > 0 ? 'vigilado › cuidado' : 'limpio ✔')
    ]), { mentions: [target] })
  }
}
