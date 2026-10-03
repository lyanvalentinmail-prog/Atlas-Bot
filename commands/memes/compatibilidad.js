// ╭────────────────────────────────────────────
// │  COMANDO » compatibilidad » % ficticio por nombres.
// ╰────────────────────────────────────────────

export default {
  name: 'compatibilidad',
  alias: ['porcentajeamor', 'match'],
  category: 'memes',
  description: 'Calcula una compatibilidad ficticia entre dos nombres.',
  usage: 'compatibilidad <nombre1> <nombre2>',

  run: async ({ reply, text, prefix, args }) => {
    const [a, b] = [args[0], args[1]]
    if (!a || !b) return reply(`» Uso: ${prefix}compatibilidad <nombre1> <nombre2>\n» Ejemplo: ${prefix}compatibilidad Lyan Maria`)

    // Determinista: mismo par = mismo resultado
    const clave = [a.toLowerCase(), b.toLowerCase()].sort().join('|')
    let hash = 0
    for (const ch of clave) hash = (hash * 33 + (ch.codePointAt(0) || 0)) >>> 0
    const porcentaje = hash % 101

    const mensaje = porcentaje >= 80 ? '¡Química total! ♡'
      : porcentaje >= 60 ? 'Hay buena onda.'
      : porcentaje >= 40 ? 'Podría funcionar.'
      : 'Mejor como amistades.'

    await reply(`> ♡ *${a}* y *${b}*:\n> Compatibilidad: *${porcentaje}%*\n> ${mensaje}`)
  }
}
