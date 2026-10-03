// ╭────────────────────────────────────────────
// │  COMANDO » registrar
// │  Registra tu nombre y edad en la cuenta.
// │  Se muestran luego en el !perfil.
// ╰────────────────────────────────────────────
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'register',
  alias: ['reg', 'verificar', 'registro', 'registrar'],
  category: 'perfil',
  description: 'Regístrate con tu nombre y edad.',
  usage: 'register <nombre> <edad>',

  run: async ({ reply, sender, args, prefix }) => {
    const account = getAccount(sender)

    const edadTexto = args.at(-1) || ''
    const nombre = args.slice(0, -1).join(' ').trim()

    if (!nombre || !/^\d{1,3}$/.test(edadTexto)) {
      return reply(`» Uso: ${prefix}register <nombre> <edad>\n» Ejemplo: ${prefix}register Lyan 20`)
    }

    const edad = Number(edadTexto)
    if (edad < 5 || edad > 100) return reply('» La edad debe estar entre 5 y 100.')
    if (nombre.length > 30) return reply('» El nombre es demasiado largo (máx. 30).')

    account.registered = {
      name: nombre,
      age: edad,
      since: Date.now()
    }
    saveDatabase()

    await reply([
      '╭─「 REGISTRO 」',
      `│ » Nombre : ${nombre}`,
      `│ » Edad   : ${edad} años`,
      '╰─────────────',
      '> ¡Registro completo! ૮₍ ˶ᵔ ᵕ ᔔ˶ ₎ა',
      `> Míralo con ${prefix}profile`
    ].join('\n'))
  }
}
