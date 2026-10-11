// ╭────────────────────────────────────────────
// │  COMANDO » bin » número decimal ⇄ binario.
// ╰────────────────────────────────────────────

export default {
  name: 'bin',
  alias: ['binn', 'decabin'],
  category: 'utilidades',
  description: 'Convierte números entre decimal y binario.',
  usage: 'bin <número decimal o binario>',

  run: async ({ reply, text, prefix }) => {
    const entrada = (text || '').replace(/\s/g, '')
    if (!entrada) return reply(`» Uso: ${prefix}bin <número>\n» Ejemplo: ${prefix}bin 42 ・ ${prefix}bin 101010`)

    if (/^[01]+$/.test(entrada) && entrada.length > 2) {
      const decimal = parseInt(entrada, 2)
      return reply(`> Binario ${entrada} = *${decimal}* en decimal.`)
    }

    const numero = parseInt(entrada, 10)
    if (Number.isNaN(numero)) return reply('» Eso no parece un número válido.')

    await reply(`> ${numero} en binario:\n> ${numero.toString(2)}`)
  }
}
