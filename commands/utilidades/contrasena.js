// ╭────────────────────────────────────────────
// │  COMANDO » contraseña » genera una segura.
// ╰────────────────────────────────────────────
import { randomInt } from 'node:crypto'

const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$%&*+?@.-_'

export default {
  name: 'password',
  alias: ['contrasena', 'passw', 'contraseña'],
  category: 'utilidades',
  description: 'Genera una contraseña aleatoria segura.',
  usage: 'password [longitud]',

  run: async ({ reply, args }) => {
    const longitud = Math.min(64, Math.max(6, Math.abs(parseInt(args[0], 10)) || 16))
    let clave = ''
    for (let i = 0; i < longitud; i++) clave += CARACTERES[randomInt(CARACTERES.length)]

    await reply(`> Contraseña (${longitud}):\n> ${clave}\n> Guárdala bien y no la compartas en el grupo.`)
  }
}
