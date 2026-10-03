// ╭────────────────────────────────────────────
// │  COMANDO » binario » texto a binario.
// ╰────────────────────────────────────────────

export default {
  name: 'binario',
  alias: ['binary', 'abinario'],
  category: 'utilidades',
  description: 'Convierte texto a código binario.',
  usage: 'binario <texto>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}binario <texto>`)

    const binario = [...text]
      .map(c => c.codePointAt(0).toString(2).padStart(8, '0'))
      .join(' ')

    await reply(`> Binario:\n> ${binario.slice(0, 900)}`)
  }
}
