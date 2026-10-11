// ╭────────────────────────────────────────────
// │  COMANDO » matrimonio » propón matrimonio
// │  virtual a otro usuario (debe aceptarlo).
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'marry',
  alias: ['casarse', 'matrimonio'],
  category: 'perfil',
  description: 'Propone un matrimonio virtual.',
  usage: 'marry @usuario',

  run: async ({ reply, sender, args, prefix, msg }) => {
    const target = getTargetUser(msg)
    if (!target || target === sender) {
      return reply(`» Uso: ${prefix}marry @usuario`)
    }

    const miCuenta = getAccount(sender)
    const suCuenta = getAccount(target)

    if (miCuenta.marriage) {
      return reply(`» Ya estás casado/a con @${miCuenta.marriage.partner}. Usa ${prefix}divorce primero.`)
    }
    if (suCuenta.marriage) {
      return reply('» Esa persona ya tiene pareja virtual.')
    }

    // ¿El otro también me propuso? » se casan
    if (suCuenta.marriagePending === getNumber(sender)) {
      miCuenta.marriage = { partner: getNumber(target), since: Date.now() }
      suCuenta.marriage = { partner: getNumber(sender), since: Date.now() }
      delete miCuenta.marriagePending
      delete suCuenta.marriagePending
      saveDatabase()
      return reply([
        '> ✿ ¡SÍ QUIERO! ✿',
        `> @${getNumber(sender)} y @${getNumber(target)} ahora están *casados virtualmente*.`,
        '> ¡Felicidades a la pareja!'
      ].join('\n'), { mentions: [sender, target] })
    }

    miCuenta.marriagePending = getNumber(target)
    saveDatabase()
    await reply([
      '> ✿ Propuesta enviada:',
      `> @${getNumber(sender)} quiere casarse contigo, @${getNumber(target)}.`,
      `> Para aceptar: @${getNumber(target)} usa *${prefix}marry @${getNumber(sender)}*`
    ].join('\n'), { mentions: [sender, target] })
  }
}
