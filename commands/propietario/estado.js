// ╭────────────────────────────────────────────
// │  COMANDO » estado » salud interna del bot.
// ╰────────────────────────────────────────────
import { formatUptime, formatBytes } from '../../lib/utils.js'
import { getUserCount } from '../../lib/database.js'
import { box, kv, section } from '../../lib/ui.js'

export default {
  name: 'status',
  alias: ['salud', 'estado'],
  category: 'propietario',
  description: 'Muestra el estado interno del bot.',
  usage: 'status',
  ownerOnly: true,

  run: async ({ reply, commands, categories, config }) => {
    const mem = process.memoryUsage()
    const base = new Set([...commands.values()]).size

    await reply(box('ESTADO DEL BOT', [
      section('Actividad'),
      kv('En línea', formatUptime(process.uptime())),
      kv('Usuarios', `${getUserCount()}`),
      '│',
      section('Comandos'),
      kv('Base', `${base}`),
      kv('Con alias', `${commands.size}`),
      kv('Categorías', `${categories.size}`),
      '│',
      section('Recursos'),
      kv('Memoria RSS', formatBytes(mem.rss)),
      kv('Heap usado', formatBytes(mem.heapUsed)),
      kv('Node.js', process.version),
      kv('Prefijo', `[ ${[...config.prefix].join(' ')} ]`)
    ]))
  }
}
