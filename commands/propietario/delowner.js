// ╭────────────────────────────────────────────
// │  COMANDO » delowner » quita dueño del bot.
// ╰────────────────────────────────────────────
import { removeExtraOwner, getExtraOwners } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'delowner',
  alias: ['quitardueño', 'quitardueno'],
  category: 'propietario',
  description: 'Elimina un propietario autorizado.',
  usage: 'delowner @usuario  o  delowner <número>',
  ownerOnly: true,

  run: async ({ msg, reply, args, prefix, config }) => {
    const target = getTargetUser(msg)
    let numero = target ? getNumber(target) : (args[0] || '').replace(/\D/g, '')

    if (!numero) return reply(`» Uso: ${prefix}delowner @usuario o ${prefix}delowner <número>`)

    // El dueño del .env es intocable desde el bot
    if (config.ownerNumbers.includes(numero)) {
      return reply('» Ese dueño está fijado en el `.env` — quitálo desde ahí.')
    }

    if (removeExtraOwner(numero)) {
      await reply(`> こ +${numero} dejó de ser dueño.`)
    } else {
      await reply('» Ese número no está entre los dueños extra.')
    }
  }
}
