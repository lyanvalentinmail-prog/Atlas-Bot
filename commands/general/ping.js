// ╭────────────────────────────────────────────
// │  COMANDO » ping
// │  Mide el tiempo que tardó en llegar el
// │  mensaje y responde con la latencia.
// ╰────────────────────────────────────────────
import { formatUptime } from '../../lib/utils.js'

export default {
  name: 'ping',
  alias: ['p', 'velocidad'],
  category: 'general',
  description: 'Comprueba la velocidad de respuesta del bot.',
  usage: 'ping',

  run: async ({ msg, reply }) => {
    const sentAt = Number(msg.messageTimestamp) * 1000
    const latency = Math.max(0, Date.now() - sentAt)

    await reply([
      '╭─「 PING 」',
      '│ » Estado    : Activo',
      `│ » Velocidad : ${latency} ms`,
      `│ » En línea  : ${formatUptime(process.uptime())}`,
      '╰─────────────'
    ].join('\n'))
  }
}
