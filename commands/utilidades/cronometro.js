// ╭────────────────────────────────────────────
// │  COMANDO » cronometro » inicia/detiene.
// ╰────────────────────────────────────────────
import { formatUptime } from '../../lib/utils.js'

const cronometros = new Map() // chatId -> timestamp de inicio

export default {
  name: 'stopwatch',
  alias: ['crono', 'cronometro'],
  category: 'utilidades',
  description: 'Inicia un cronómetro.',
  usage: 'stopwatch [ver|parar]',

  run: async ({ reply, chatId, args }) => {
    const accion = (args[0] || '').toLowerCase()

    if (accion === 'parar' || accion === 'stop') {
      const inicio = cronometros.get(chatId)
      if (!inicio) return reply('» No hay cronómetro activo en este chat.')
      cronometros.delete(chatId)
      return reply(`> Cronómetro detenido:\n> Tiempo total: *${formatUptime((Date.now() - inicio) / 1000)}*`)
    }

    if (accion === 'ver') {
      const inicio = cronometros.get(chatId)
      if (!inicio) return reply('» No hay cronómetro activo. Inicia con: !cronometro')
      return reply(`> Cronómetro en marcha:\n> ${formatUptime((Date.now() - inicio) / 1000)}`)
    }

    if (cronometros.has(chatId)) {
      return reply('» Ya hay un cronómetro activo. Usa: !cronometro ver ・ !cronometro parar')
    }

    cronometros.set(chatId, Date.now())
    await reply('> ゝ Cronómetro *iniciado*.\n> !cronometro ver ・ !cronometro parar')
  }
}
