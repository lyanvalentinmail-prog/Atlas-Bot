// ╭────────────────────────────────────────────
// │  COMANDO » reputacion » puntos de rep.
// │  reputacion @usuario + » le suma uno.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'rep',
  alias: ['puntosrep', 'reputacion'],
  category: 'perfil',
  description: 'Muestra tu reputación virtual (+1 a otros).',
  usage: 'rep [@usuario] [+]',

  run: async ({ msg, reply, sender, args, prefix }) => {
    const target = getTargetUser(msg)
    const quiereSumar = (args[0] === '+' || args.at(-1) === '+')

    if (target && quiereSumar && target !== sender) {
      const cuenta = getAccount(target)
      cuenta.rep += 1
      saveDatabase()
      return reply(`> こ Le diste *+1 rep* a @${getNumber(target)} (total: ${cuenta.rep}).`, { mentions: [target] })
    }

    const objetivo = target || sender
    const cuenta = getAccount(objetivo)

    await reply([
      `> Reputación de @${getNumber(objetivo)}: *${cuenta.rep}*`,
      `> Súmale con: ${prefix}rep @usuario +`
    ].join('\n'), { mentions: [objetivo] })
  }
}
