// ╭────────────────────────────────────────────
// │  COMANDO » info
// │  Información del bot y del servidor.
// ╰────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { formatUptime, formatBytes } from '../../lib/utils.js'
import { box, kv, section, hint } from '../../lib/ui.js'

const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
)

export default {
  name: 'info',
  alias: ['infobot', 'sobrebot'],
  category: 'informacion',
  description: 'Muestra información del bot y del sistema.',
  usage: 'info',

  run: async ({ reply, config, categories }) => {
    const totalCommands = [...categories.values()]
      .reduce((sum, list) => sum + list.length, 0)
    const baileysVersion = pkg.dependencies?.['@whiskeysockets/baileys'] || 'desconocida'

    await reply(box(`${config.botName.toUpperCase()} ・ INFO`, [
      section('Bot'),
      kv('Versión', config.botVersion),
      kv('Librería', `Baileys ${baileysVersion}`),
      kv('Dueño', config.ownerName),
      kv('Prefijo', `[ ${[...config.prefix].join(' ')} ]`),
      kv('Comandos', `${totalCommands} en ${categories.size} categorías`),
      '│',
      section('Servidor'),
      kv('Node.js', process.version),
      kv('Sistema', `${process.platform} (${process.arch})`),
      kv('Memoria', formatBytes(process.memoryUsage().rss)),
      kv('En línea', formatUptime(process.uptime()))
    ], hint(`Repo y guía completa: ${config.repoUrl}`)))
  }
}
