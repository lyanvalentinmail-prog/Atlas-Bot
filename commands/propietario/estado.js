// ╭────────────────────────────────────────────
// │  COMANDO » estado » salud interna del bot.
// ╰────────────────────────────────────────────
import { formatUptime, formatBytes } from '../../lib/utils.js'
import { getUserCount } from '../../lib/database.js'

export default {
  name: 'estado',
  alias: ['status', 'salud'],
  category: 'propietario',
  description: 'Muestra el estado interno del bot.',
  usage: 'estado',
  ownerOnly: true,

  run: async ({ reply, commands, categories, config }) => {
    const mem = process.memoryUsage()
    const base = new Set([...commands.values()]).size

    await reply([
      '╭─「 ESTADO DEL BOT 」',
      `│ » Uptime      : ${formatUptime(process.uptime())}`,
      `│ » Memoria     : ${formatBytes(mem.rss)} (RSS)`,
      `│ » Heap usado  : ${formatBytes(mem.heapUsed)}`,
      `│ » Node.js     : ${process.version}`,
      `│ » Prefijo     : ${config.prefix}`,
      `│ » Categorías  : ${categories.size} ・ Comandos: ${base} (${commands.size} con alias)`,
      `│ » Usuarios    : ${getUserCount()}`,
      '╰─────────────'
    ].join('\n'))
  }
}
