// ╭────────────────────────────────────────────
// │  COMANDO » bio » lee o cambia tu biografía.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'bio',
  alias: ['biografia', 'sobremi'],
  category: 'perfil',
  description: 'Muestra o modifica tu biografía.',
  usage: 'bio [nuevo texto] ・ bio @usuario',

  run: async ({ msg, reply, sender, text, prefix }) => {
    const target = getTargetUser(msg)

    // Ver la bio de otro
    if (target && !text) {
      const cuenta = getAccount(target)
      return reply(`> Bio de @${getNumber(target)}:\n> ${cuenta.bio || '(sin biografía todavía)'}`, { mentions: [target] })
    }

    // Ver tu bio
    if (!text) {
      const cuenta = getAccount(sender)
      return reply(`> Tu biografía:\n> ${cuenta.bio || '(vacía)'}\n> Cámbiala con: ${prefix}bio Soy fan del anime y el código.`)
    }

    // Cambiar tu bio
    const cuenta = getAccount(sender)
    cuenta.bio = text.slice(0, 300)
    saveDatabase()
    await reply('> こ Biografía actualizada.')
  }
}
