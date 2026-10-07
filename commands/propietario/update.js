// ╭────────────────────────────────────────────
// │  COMANDO » update » comprueba actualizaciones
// │  del proyecto (git fetch + rev-list).
// ╰────────────────────────────────────────────
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execCb)

export default {
  name: 'update',
  alias: ['actualizar', 'checkupdate'],
  category: 'propietario',
  description: 'Comprueba si existen actualizaciones.',
  usage: 'update',

  ownerOnly: true,

  run: async ({ reply }) => {
    try {
      await exec('git fetch origin', { cwd: process.cwd(), timeout: 30000 })
      const { stdout: rama } = await exec('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd() })
      const { stdout: atras } = await exec(`git rev-list --count HEAD..origin/${rama.trim()}`, { cwd: process.cwd() })
      const atrasNum = parseInt(atras.trim(), 10) || 0

      if (atrasNum === 0) {
        await reply(`> ✓ El bot está actualizado (rama *${rama.trim()}*).`)
      } else {
        await reply(`> Hay *${atrasNum}* commit(s) nuevos.\n> Para aplicar: haz git pull y reinicia (${process.env.PM2_HOME ? 'pm2 restart' : 'npm start'}).`)
      }
    } catch {
      await reply('» No pude comprobar actualizaciones (¿este bot se instaló con git clone?).')
    }
  }
}
