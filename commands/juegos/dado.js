// ╭────────────────────────────────────────────
// │  COMANDO » dado
// │  Tira un dado de 6 caras.
// ╰────────────────────────────────────────────

export default {
  name: 'dice',
  alias: ['dado'],
  category: 'juegos',
  description: 'Tira un dado y muestra el resultado.',
  usage: 'dice',

  run: async ({ reply }) => {
    const result = Math.floor(Math.random() * 6) + 1
    await reply(`╭─「 DADO 」\n│ » Salió: *${result}*\n╰─────────────`)
  }
}
