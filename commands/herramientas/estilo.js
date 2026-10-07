// ╭────────────────────────────────────────────
// │  COMANDO » estilo
// │  Convierte texto en fuentes decorativas
// │  usando caracteres Unicode (sin emojis).
// ╰────────────────────────────────────────────
import { toSmallCaps } from '../../lib/utils.js'

// Variantes disponibles » cada una recibe el texto y lo transforma
const MARCAS = {
  1: { nombre: 'small caps', fn: (t) => toSmallCaps(t) },
  2: {
    nombre: 'invertido',
    fn: (t) => [...t].reverse().map(c => {
      const mapa = { a:'ɐ', b:'q', c:'ɔ', d:'p', e:'ǝ', f:'ɟ', g:'ƃ', h:'ɥ', i:'ᴉ', j:'ɾ', k:'ʞ', l:'l', m:'ɯ', n:'u', o:'o', p:'d', q:'b', r:'ɹ', s:'s', t:'ʇ', u:'n', v:'ʌ', w:'ʍ', x:'x', y:'ʎ', z:'z', '?':'¿', '!':'¡' }
      return mapa[c.toLowerCase()] || c
    }).join('')
  },
  3: {
    nombre: 'espaciado',
    fn: (t) => [...t].join('\u200A') // espacio fino Unicode
  },
  4: {
    nombre: 'tachado',
    fn: (t) => [...t].map(c => c === ' ' ? c : c + '\u0336').join('')
  },
  5: {
    nombre: 'subrayado',
    fn: (t) => [...t].map(c => c === ' ' ? c : c + '\u0332').join('')
  },
  6: {
    nombre: 'burbujas ·',
    fn: (t) => [...t].map(c => '·' + c).join('') + '·'
  },
  7: {
    nombre: '▒ bloques',
    fn: (t) => '▒▒ ' + t.toUpperCase() + ' ▒▒'
  },
  8: {
    nombre: 'decorado',
    fn: (t) => `彡 ${t} 彡`
  }
}

export default {
  name: 'style',
  alias: ['font', 'fuentes', 'letras', 'estilo'],
  category: 'herramientas',
  description: 'Convierte texto en fuentes decorativas.',
  usage: 'style <texto>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}style <texto>\n» Ejemplo: ${prefix}style hola mundo`)

    const lineas = Object.entries(MARCAS).map(
      ([numero, marca]) => `${numero}. ${marca.fn(text)}`
    )

    await reply(`> Estilos para *${text}* :\n\n${lineas.join('\n')}`)
  }
}
