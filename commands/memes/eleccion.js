// ╭────────────────────────────────────────────
// │  COMANDO » eleccion » elige entre opciones.
// ╰────────────────────────────────────────────

export default {
  name: 'choose',
  alias: ['elegir', 'eleccion'],
  category: 'memes',
  description: 'Elige aleatoriamente entre varias opciones.',
  usage: 'choose <a> o <b> o <c>',

  run: async ({ reply, text, prefix }) => {
    const opciones = text.split(/\s+o\s+|,|\|/).map(o => o.trim()).filter(Boolean)

    if (opciones.length < 2) {
      return reply(`» Uso: ${prefix}choose <opción1> o <opción2> [o <opción3>...]\n» Ejemplo: ${prefix}choose pizza o asado o pasta`)
    }

    const elegida = opciones[Math.floor(Math.random() * opciones.length)]
    await reply(`> こ Elijo: *${elegida}*`)
  }
}
