// ╭────────────────────────────────────────────
// │  COMANDO » hex » texto a hexadecimal.
// ╰────────────────────────────────────────────

export default {
  name: 'hex',
  alias: ['hexadecimal'],
  category: 'utilidades',
  description: 'Convierte texto a formato hexadecimal.',
  usage: 'hex <texto>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}hex <texto>`)

    const hex = Buffer.from(text, 'utf-8').toString('hex')
    await reply(`> Hexadecimal:\n> ${hex.slice(0, 900)}`)
  }
}
