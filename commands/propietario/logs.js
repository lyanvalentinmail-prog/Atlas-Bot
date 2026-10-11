// ╭────────────────────────────────────────────
// │  COMANDO » logs » últimas líneas de consola.
// ╰────────────────────────────────────────────
import { getLogs } from '../../lib/logger.js'

export default {
  name: 'logs',
  alias: ['registros', 'ultimoseventos'],
  category: 'propietario',
  description: 'Muestra registros recientes del bot.',
  usage: 'logs [cantidad]',
  ownerOnly: true,

  run: async ({ reply, args }) => {
    const cantidad = Math.min(30, Math.max(5, Math.abs(parseInt(args[0], 10)) || 12))
    const lineas = getLogs(cantidad)

    if (lineas.length === 0) return reply('» Aún no hay registros en esta sesión.')

    await reply(`> Últimas ${lineas.length} líneas:\n\`\`\`\n${lineas.join('\n')}\n\`\`\``)
  }
}
