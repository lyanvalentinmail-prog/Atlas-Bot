// ╭────────────────────────────────────────────
// │  COMANDO » dado
// │  Tira un dado de 6 caras.
// ╰────────────────────────────────────────────

export default {
  name: 'dado',
  alias: ['dice'],
  category: 'juegos',
  description: 'Tira un dado y muestra el resultado.',
  usage: 'dado',

  run: async ({ reply }) => {
    const result = Math.floor(Math.random() * 6) + 1
    await reply(`╭─「 DADO 」\n│ » Salió: *${result}*\n╰─────────────`)
  }
}
