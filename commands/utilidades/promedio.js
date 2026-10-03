// ╭────────────────────────────────────────────
// │  COMANDO » promedio » media de números.
// ╰────────────────────────────────────────────

export default {
  name: 'promedio',
  alias: ['media', 'average'],
  category: 'utilidades',
  description: 'Calcula el promedio de varios números.',
  usage: 'promedio <números separados por espacio>',

  run: async ({ reply, args, prefix }) => {
    const nums = args.map(a => parseFloat(a.replace(',', '.'))).filter(n => !Number.isNaN(n))
    if (nums.length < 2) return reply(`» Uso: ${prefix}promedio 4 8 15 16 23 42`)

    const suma = nums.reduce((a, b) => a + b, 0)
    const promedio = suma / nums.length
    const min = Math.min(...nums)
    const max = Math.max(...nums)

    await reply([
      `> Cantidad : ${nums.length}`,
      `> Suma     : ${Number(suma.toFixed(4))}`,
      `> Promedio : *${Number(promedio.toFixed(4))}*`,
      `> Mín/Máx  : ${min} / ${max}`
    ].join('\n'))
  }
}
