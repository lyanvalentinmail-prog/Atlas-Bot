// ╭────────────────────────────────────────────
// │  COMANDO » ppt
// │  Piedra, papel o tijera contra el bot.
// ╰────────────────────────────────────────────

const OPTIONS = ['piedra', 'papel', 'tijera']
const WINS_AGAINST = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' }

export default {
  name: 'ppt',
  alias: ['piedrapapeltijera'],
  category: 'juegos',
  description: 'Juega piedra, papel o tijera contra el bot.',
  usage: 'ppt <piedra|papel|tijera>',

  run: async ({ reply, args, prefix }) => {
    const choice = (args[0] || '').toLowerCase().replace(/s$/, '')
    if (!OPTIONS.includes(choice)) {
      return reply(`» Uso: ${prefix}ppt <piedra/papel/tijera>`)
    }

    const botChoice = OPTIONS[Math.floor(Math.random() * OPTIONS.length)]

    let result
    if (choice === botChoice) result = '*Empate* » lo intentamos de nuevo.'
    else if (WINS_AGAINST[choice] === botChoice) result = '*Ganaste* » buena jugada.'
    else result = '*Perdiste* » suerte la próxima.'

    await reply([
      '╭─「 PIEDRA ・ PAPEL ・ TIJERA 」',
      `│ » Tú  : ${choice}`,
      `│ » Bot : ${botChoice}`,
      '╰─────────────',
      `> ${result}`
    ].join('\n'))
  }
}
