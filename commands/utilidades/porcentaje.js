// ╭────────────────────────────────────────────
// │  COMANDO » porcentaje » cálculos rápidos:
// │  porcentaje 20 80 » el 20% de 80
// │  porcentaje 20 de 80 » 20 es qué % de 80
// ╰────────────────────────────────────────────

export default {
  name: 'porcentaje',
  alias: ['percent', 'porciento'],
  category: 'utilidades',
  description: 'Calcula porcentajes rápidamente.',
  usage: 'porcentaje <x> <y>  o  porcentaje <x> de <y>',

  run: async ({ reply, args, prefix }) => {
    const nums = args.map(a => parseFloat(a.replace(',', '.'))).filter(n => !Number.isNaN(n))
    const modoDe = args.some(a => a.toLowerCase() === 'de')

    if (nums.length < 2) {
      return reply(
        `» Uso:\n` +
        `» ${prefix}porcentaje 20 80 » el 20% de 80\n` +
        `» ${prefix}porcentaje 20 de 80 » 20 es qué % de 80`
      )
    }

    const [a, b] = nums
    if (modoDe) {
      if (b === 0) return reply('» No puedo dividir entre cero.')
      return reply(`> ${a} es el *${((a / b) * 100).toFixed(2).replace(/\.00$/, '')}%* de ${b}.`)
    }

    await reply(`> El ${a}% de ${b} es *${((a / 100) * b).toFixed(2).replace(/\.00$/, '')}*.`)
  }
}
