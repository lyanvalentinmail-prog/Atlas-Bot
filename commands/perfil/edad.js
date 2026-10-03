// ╭────────────────────────────────────────────
// │  COMANDO » edad » edad registrada de un usuario.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'age',
  alias: ['cuantosaños', 'edad'],
  category: 'perfil',
  description: 'Muestra la edad registrada de un usuario.',
  usage: 'age [@usuario]',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)
    const reg = cuenta.registered

    if (!reg?.age) {
      return reply(`» @${getNumber(target)} no tiene edad registrada.\n> Que use: ${prefix}register <nombre> <edad>`, { mentions: [target] })
    }

    await reply(`> @${getNumber(target)} (${reg.name}) tiene *${reg.age} años*.`, { mentions: [target] })
  }
}
