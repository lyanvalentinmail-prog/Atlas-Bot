// ╭────────────────────────────────────────────
// │  COMANDO » convertir » unidades comunes.
// ╰────────────────────────────────────────────

const RUTAS = {
  'kmh mph': v => [v * 0.621371, 'mph'],
  'mph kmh': v => [v * 1.60934, 'km/h'],
  'cm pulgadas': v => [v * 0.393701, 'in'],
  'pulgadas cm': v => [v * 2.54, 'cm'],
  'km millas': v => [v * 0.621371, 'mi'],
  'millas km': v => [v * 1.60934, 'km'],
  'm pies': v => [v * 3.28084, 'ft'],
  'pies m': v => [v * 0.3048, 'm'],
  'kg libras': v => [v * 2.20462, 'lb'],
  'libras kg': v => [v * 0.453592, 'kg'],
  'c f': v => [v * 9 / 5 + 32, '°F'],
  'f c': v => [(v - 32) * 5 / 9, '°C'],
  'c k': v => [v + 273.15, 'K'],
  'k c': v => [v - 273.15, '°C']
}

export default {
  name: 'convertir',
  alias: ['convert', 'unidades'],
  category: 'utilidades',
  description: 'Convierte unidades entre diferentes sistemas.',
  usage: 'convertir <valor> <de> <a>',

  run: async ({ reply, args, prefix }) => {
    const valor = parseFloat((args[0] || '').replace(',', '.'))
    const de = (args[1] || '').toLowerCase()
    const a = (args[3] || args[2] || '').toLowerCase()

    if (Number.isNaN(valor) || !de || !a) {
      const rutas = [...new Set(Object.keys(RUTAS).flatMap(k => k.split(' ')))].join(', ')
      return reply(`» Uso: ${prefix}convertir <valor> <de> a <a>\n» Ejemplo: ${prefix}convertir 100 km/h a mph\n» Unidades: ${rutas}`)
    }

    const ruta = RUTAS[`${de} ${a}`]
    if (!ruta) return reply(`» No sé convertir de *${de}* a *${a}* todavía.`)

    const [resultado, unidad] = ruta(valor)
    await reply(`> ${valor} ${de} = *${Number(resultado.toFixed(4))} ${unidad}*`)
  }
}
