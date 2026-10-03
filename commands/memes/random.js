// ╭────────────────────────────────────────────
// │  COMANDO » random » número al azar.
// ╰────────────────────────────────────────────

export default {
  name: 'random',
  alias: ['rand', 'numaleatorio'],
  category: 'memes',
  description: 'Genera un número aleatorio.',
  usage: 'random [mínimo] [máximo]',

  run: async ({ reply, args }) => {
    let min = 1, max = 100
    const a = parseInt(args[0], 10), b = parseInt(args[1], 10)

    if (!Number.isNaN(a) && !Number.isNaN(b)) { min = Math.min(a, b); max = Math.max(a, b) }
    else if (!Number.isNaN(a)) { max = a }

    const numero = Math.floor(Math.random() * (max - min + 1)) + min
    await reply(`> Número al azar entre ${min} y ${max}:\n> *${numero}*`)
  }
}
