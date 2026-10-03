// ╭────────────────────────────────────────────
// │  COMANDO » addowner » añade dueño del bot.
// ╰────────────────────────────────────────────
import { addExtraOwner } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'addowner',
  alias: ['nuevodueño', 'nuevodueno'],
  category: 'propietario',
  description: 'Agrega un propietario autorizado.',
  usage: 'addowner @usuario  o  addowner <número>',
  ownerOnly: true,

  run: async ({ msg, reply, args, prefix }) => {
    const target = getTargetUser(msg)
    let numero = target ? getNumber(target) : (args[0] || '').replace(/\D/g, '')

    if (!numero || numero.length < 8) {
      return reply(`» Uso: ${prefix}addowner @usuario  o  ${prefix}addowner 59898765432`)
    }

    const listo = addExtraOwner(numero)
    if (listo) {
      await reply(`> こ +${numero} ahora es *dueño del bot*.`)
    } else {
      await reply('» Ese número ya era dueño.')
    }
  }
}
