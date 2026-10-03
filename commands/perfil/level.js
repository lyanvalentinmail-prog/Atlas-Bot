// ╭────────────────────────────────────────────
// │  COMANDO » level » nivel actual con barra.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import { getTargetUser, getNumber } from '../../lib/utils.js'

const expNecesaria = (nivel) => nivel * 100

export default {
  name: 'level',
  alias: ['nivel', 'lvl'],
  category: 'perfil',
  description: 'Muestra tu nivel actual.',
  usage: 'level [@usuario]',

  run: async ({ msg, reply, sender }) => {
    const target = getTargetUser(msg) || sender
    const cuenta = getAccount(target)
    const expPara = expNecesaria(cuenta.level)
    const progreso = Math.min(10, Math.floor((cuenta.exp / expPara) * 10))

    await reply([
      `╭─「 NIVEL DE @${getNumber(target)} 」`,
      `│ » Nivel : *${cuenta.level}*`,
      `│ » Exp   : ${cuenta.exp}/${expPara}`,
      `│ » [${'█'.repeat(progreso)}${'░'.repeat(10 - progreso)}]`,
      '╰─────────────',
      '> Ganas exp trabajando (!work), jugando y ganando minijuegos.'
    ].join('\n'), { mentions: [target] })
  }
}
