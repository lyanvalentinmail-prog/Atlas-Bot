// ╭────────────────────────────────────────────
// │  COMANDO » level » nivel actual con barra.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { box, kv, hint, bar, num } from '../../lib/ui.js'

const expNecesaria = (nivel) => nivel * 100

export default {
  name: 'level',
  alias: ['nivel', 'lvl'],
  category: 'perfil',
  description: 'Muestra tu nivel actual.',
  usage: 'level [@usuario]',

  run: async ({ msg, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)
    const expPara = expNecesaria(cuenta.level)
    const falta = Math.max(0, expPara - cuenta.exp)

    await reply(box(`NIVEL DE @${getNumber(target)}`, [
      `│ ${bar(cuenta.exp, expPara, 14)}  ${Math.min(100, Math.floor((cuenta.exp / expPara) * 100))}%`,
      kv('Nivel', `*${cuenta.level}*`),
      kv('Exp', `${num(cuenta.exp)}/${num(expPara)}`),
      kv('Falta', `${num(falta)} exp para el nivel ${cuenta.level + 1}`)
    ], hint(`Ganas exp con ${prefix}work, ${prefix}crime y minijuegos.`)),
      { mentions: [target] })
  }
}
