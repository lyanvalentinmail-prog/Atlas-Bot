// ╭────────────────────────────────────────────
// │  COMANDO » divorcio » termina el matrimonio virtual.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'divorce',
  alias: ['separarse', 'divorcio'],
  category: 'perfil',
  description: 'Finaliza un matrimonio virtual.',
  usage: 'divorce',

  run: async ({ reply, sender }) => {
    const cuenta = getAccount(sender)

    if (!cuenta.marriage) return reply('» No estás casado/a virtualmente.')

    const pareja = cuenta.marriage.partner
    const cuentaPareja = getAccount(`${pareja}@s.whatsapp.net`)
    if (cuentaPareja?.marriage?.partner === getNumber(sender)) {
      delete cuentaPareja.marriage
    }
    delete cuenta.marriage
    delete cuenta.marriagePending
    saveDatabase()

    await reply([
      '> ✘ Divorcio finalizado.',
      `> @${getNumber(sender)} y @${pareja} ya no están casados.`,
    ].join('\n'), { mentions: [sender, `${pareja}@s.whatsapp.net`] })
  }
}
