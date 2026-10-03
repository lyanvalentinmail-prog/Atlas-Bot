// ╭────────────────────────────────────────────
// │  COMANDO » info
// │  Información del bot y del servidor.
// ╰────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { formatUptime, formatBytes } from '../../lib/utils.js'

const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
)

export default {
  name: 'info',
  alias: ['infobot', 'estado'],
  category: 'general',
  description: 'Muestra información del bot y del sistema.',
  usage: 'info',

  run: async ({ reply, config, categories }) => {
    const totalCommands = [...categories.values()]
      .reduce((sum, list) => sum + list.length, 0)
    const baileysVersion = pkg.dependencies?.['@whiskeysockets/baileys'] || 'desconocida'

    await reply([
      '╭─「 INFORMACIÓN 」',
      `│ » Bot       : ${config.botName}`,
      `│ » Versión   : ${config.botVersion}`,
      `│ » Librería  : Baileys ${baileysVersion}`,
      `│ » Dueño     : ${config.ownerName}`,
      `│ » Prefijo   : [ ${[...config.prefix].join(' ')} ]`,
      `│ » Comandos  : ${totalCommands}`,
      '│─────────────',
      `│ » Node.js   : ${process.version}`,
      `│ » Sistema   : ${process.platform} (${process.arch})`,
      `│ » Memoria   : ${formatBytes(process.memoryUsage().rss)}`,
      `│ » En línea  : ${formatUptime(process.uptime())}`,
      '╰─────────────'
    ].join('\n'))
  }
}
