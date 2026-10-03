// ╭────────────────────────────────────────────
// │  COMANDO » eleccion » elige entre opciones.
// ╰────────────────────────────────────────────

export default {
  name: 'eleccion',
  alias: ['choose', 'elegir'],
  category: 'memes',
  description: 'Elige aleatoriamente entre varias opciones.',
  usage: 'eleccion <a> o <b> o <c>',

  run: async ({ reply, text, prefix }) => {
    const opciones = text.split(/\s+o\s+|,|\|/).map(o => o.trim()).filter(Boolean)

    if (opciones.length < 2) {
      return reply(`» Uso: ${prefix}eleccion <opción1> o <opción2> [o <opción3>...]\n» Ejemplo: ${prefix}eleccion pizza o asado o pasta`)
    }

    const elegida = opciones[Math.floor(Math.random() * opciones.length)]
    await reply(`> こ Elijo: *${elegida}*`)
  }
}
