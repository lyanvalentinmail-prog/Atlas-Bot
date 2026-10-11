// ╭────────────────────────────────────────────
// │  COMANDO » morse
// │  Convierte texto a código morse y viceversa.
// │  Si el texto solo tiene puntos y rayas,
// │  se decodifica automáticamente.
// ╰────────────────────────────────────────────

const MORSE = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.',
  g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..',
  m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.',
  s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
  y: '-.--', z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.'
}

const INVERTIDO = Object.fromEntries(
  Object.entries(MORSE).map(([letra, codigo]) => [codigo, letra])
)

export default {
  name: 'morse',
  alias: ['codigomorse'],
  category: 'herramientas',
  description: 'Codifica/decodifica texto en morse.',
  usage: 'morse <texto o código>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}morse <texto>\n» Ejemplo: ${prefix}morse hola mundo`)

    // ¿Es código morse? (solo puntos, rayas y espacios)
    if (/^[.\-\s/]+$/.test(text.trim())) {
      const decodificado = text.trim().split(/\//).map(linea =>
        linea.trim().split(/\s+/)
          .map(codigo => INVERTIDO[codigo] || '?')
          .join('')
      ).join(' ')
      return reply(`> Ｄecodificado :\n> ${decodificado.toUpperCase()}`)
    }

    const codificado = [...text.toLowerCase()]
      .map(char => {
        if (char === ' ') return '/'
        if (MORSE[char]) return MORSE[char]
        return char // deja letras/símbolos sin equivalente tal cual
      })
      .join(' ')

    await reply(`> Morse :\n> ${codificado}`)
  }
}
