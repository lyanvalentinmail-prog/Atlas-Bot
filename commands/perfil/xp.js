// ╭────────────────────────────────────────────
// │  COMANDO » xp » experiencia acumulada.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'xp',
  alias: ['exp', 'experiencia'],
  category: 'perfil',
  description: 'Muestra tu experiencia acumulada.',
  usage: 'xp [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)

    await reply(`> @${getNumber(target)} tiene *${cuenta.exp} exp* (nivel ${cuenta.level}).`, { mentions: [target] })
  }
}
