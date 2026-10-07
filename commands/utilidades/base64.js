// ╭────────────────────────────────────────────
// │  COMANDO » base64 » codifica/decodifica.
// ╰────────────────────────────────────────────

export default {
  name: 'base64',
  alias: ['b64'],
  category: 'utilidades',
  description: 'Codifica o decodifica texto en Base64.',
  usage: 'base64 <texto o código>',

  run: async ({ reply, text, args, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}base64 <texto>\n» Ejemplo: ${prefix}base64 hola mundo`)

    const modo = (args[0] || '').toLowerCase()
    if (modo === '-d' || modo === 'dec') {
      const entrada = args.slice(1).join(' ')
      try {
        const dec = Buffer.from(entrada, 'base64').toString('utf-8')
        if (Buffer.from(dec, 'utf-8').toString('base64') !== entrada.replace(/\s/g, '')) throw 0
        return reply(`> Decodificado:\n> ${dec}`)
      } catch {
        return reply('» Ese texto no parece Base64 válido.')
      }
    }

    const codificado = Buffer.from(text, 'utf-8').toString('base64')
    await reply(`> Base64:\n> ${codificado}\n> (decodifica con: ${prefix}base64 -d <código>)`)
  }
}
