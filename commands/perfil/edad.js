// ╭────────────────────────────────────────────
// │  COMANDO » edad » edad registrada de un usuario.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'edad',
  alias: ['age', 'cuantosaños'],
  category: 'perfil',
  description: 'Muestra la edad registrada de un usuario.',
  usage: 'edad [@usuario]',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)
    const reg = cuenta.registered

    if (!reg?.age) {
      return reply(`» @${getNumber(target)} no tiene edad registrada.\n> Que use: ${prefix}registrar <nombre> <edad>`, { mentions: [target] })
    }

    await reply(`> @${getNumber(target)} (${reg.name}) tiene *${reg.age} años*.`, { mentions: [target] })
  }
}
