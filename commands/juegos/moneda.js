// ╭────────────────────────────────────────────
// │  COMANDO » moneda
// │  Lanza una moneda: cara o cruz.
// │  Puedes apostar tu elección: !moneda cara
// ╰────────────────────────────────────────────

export default {
  name: 'coin',
  alias: ['caracruz', 'moneda'],
  category: 'juegos',
  description: 'Lanza una moneda al aire.',
  usage: 'coin [cara|cruz]',

  run: async ({ reply, args }) => {
    const guess = (args[0] || '').toLowerCase()
    const result = Math.random() < 0.5 ? 'cara' : 'cruz'

    let extra = ''
    if (['cara', 'cruz'].includes(guess)) {
      extra = guess === result ? '\n> ¡Acertaste!' : '\n> Fallaste, era ' + result + '.'
    }

    await reply(`╭─「 MONEDA 」\n│ » Salió: *${result}*\n╰─────────────${extra}`)
  }
}
