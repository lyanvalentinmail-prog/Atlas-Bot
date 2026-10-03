// ╭────────────────────────────────────────────
// │  COMANDO » ping
// │  Respuesta directa con la latencia en ms:
// │
// │  🏓 Pong!
// │
// │  ⚡ 12ms
// ╰────────────────────────────────────────────

export default {
  name: 'ping',
  alias: ['p', 'velocidad'],
  category: 'informacion',
  description: 'Comprueba la velocidad de respuesta del bot.',
  usage: 'ping',

  run: async ({ msg, reply }) => {
    // Latencia real: tiempo desde que enviaste el mensaje.
    // (messageTimestamp llega en segundos con Baileys)
    const sentAt = Number(msg.messageTimestamp) * 1000
    const latency = sentAt > 0 ? Math.max(0, Date.now() - sentAt) : 0

    await reply(`🏓 Pong!\n\n⚡ ${latency}ms`)
  }
}
