// ╭────────────────────────────────────────────
// │  COMANDO » familia » tu familia virtual.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'family',
  alias: ['pareja', 'familia'],
  category: 'perfil',
  description: 'Muestra tu familia virtual.',
  usage: 'family [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)
    const numero = getNumber(target)

    const lineas = [`╭─「 FAMILIA DE @${numero} 」`]

    if (cuenta.marriage) {
      const dias = Math.floor((Date.now() - cuenta.marriage.since) / (24 * 60 * 60 * 1000))
      lineas.push(`│ » Pareja : @${cuenta.marriage.partner} (hace ${dias} día(s))`)
    } else {
      lineas.push('│ » Pareja : soltero/a (cásate con !matrimonio)')
    }

    if (cuenta.registered?.name) lineas.push(`│ » Nombre : ${cuenta.registered.name}`)
    lineas.push('╰─────────────')

    await reply(lineas.join('\n'), {
      mentions: cuenta.marriage ? [target, `${cuenta.marriage.partner}@s.whatsapp.net`] : [target]
    })
  }
}
