// ╭────────────────────────────────────────────
// │  COMANDO » traducir
// │  Traduce texto con Google Translate
// │  (endpoint público, sin registro).
// │  !traducir en Hola mundo
// │  o respondiendo a un mensaje: !traducir en
// ╰────────────────────────────────────────────
import { fetchJson, getQuoted } from '../../lib/utils.js'

const LANGS = ['es', 'en', 'pt', 'fr', 'it', 'de', 'ja', 'ko', 'zh', 'ru', 'ar']

export default {
  name: 'translate',
  alias: ['tr', 'traducir'],
  category: 'herramientas',
  description: 'Traduce texto a otro idioma.',
  usage: 'translate <idioma> [texto]',

  run: async ({ msg, reply, args, prefix }) => {
    const lang = (args[0] || '').toLowerCase()
    let text = args.slice(1).join(' ')

    // Si respondes a un mensaje, traduce ese texto
    if (!text) {
      const quoted = getQuoted(msg)
      const m = quoted?.message || {}
      text = m.conversation || m.extendedTextMessage?.text || ''
    }

    if (!LANGS.includes(lang) || !text) {
      return reply(
        `» Uso: ${prefix}translate <idioma> <texto>\n` +
        `» Ejemplo: ${prefix}translate en Hola, ¿cómo estás?\n` +
        `» Idiomas: ${LANGS.join(', ')}`
      )
    }

    try {
      const data = await fetchJson(
        'https://translate.googleapis.com/translate_a/single' +
        `?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
      )
      const translated = (data?.[0] || []).map(part => part?.[0] || '').join('')
      if (!translated) throw new Error('sin traducción')

      await reply([
        '╭─「 TRADUCTOR 」',
        `│ » A : ${lang}`,
        '╰─────────────',
        `> ${translated}`
      ].join('\n'))
    } catch {
      await reply('» No se pudo traducir. Intenta más tarde.')
    }
  }
}
