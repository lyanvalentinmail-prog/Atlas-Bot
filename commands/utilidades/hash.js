// ╭────────────────────────────────────────────
// │  COMANDO » hash » md5/sha1/sha256/sha512.
// ╰────────────────────────────────────────────
import { createHash } from 'node:crypto'

export default {
  name: 'hash',
  alias: ['sha256', 'md5'],
  category: 'utilidades',
  description: 'Genera un hash a partir de un texto.',
  usage: 'hash [sha256] <texto>',

  run: async ({ reply, args, prefix }) => {
    const algoritmos = ['md5', 'sha1', 'sha256', 'sha512']
    let algoritmo = 'sha256'
    let texto = args.join(' ')

    if (algoritmos.includes((args[0] || '').toLowerCase())) {
      algoritmo = args[0].toLowerCase()
      texto = args.slice(1).join(' ')
    }

    if (!texto) return reply(`» Uso: ${prefix}hash [${algoritmos.join('|')}] <texto>`)

    const resultado = createHash(algoritmo).update(texto, 'utf-8').digest('hex')
    await reply(`> ${algoritmo.toUpperCase()}:\n> ${resultado}`)
  }
}
