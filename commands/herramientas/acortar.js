// ╭────────────────────────────────────────────
// │  COMANDO » acortar
// │  Acorta un enlace con TinyURL
// │  (API gratuita, sin registro).
// ╰────────────────────────────────────────────

export default {
  name: 'acortar',
  alias: ['short', 'tinyurl'],
  category: 'herramientas',
  description: 'Acorta un enlace largo.',
  usage: 'acortar <url>',

  run: async ({ reply, args, prefix }) => {
    const url = args[0] || ''
    if (!/^https?:\/\/.+/i.test(url)) {
      return reply(`» Uso: ${prefix}acortar <url>\n» Ejemplo: ${prefix}acortar https://ejemplo.com/pagina-muy-larga`)
    }

    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
      )
      const short = (await response.text()).trim()
      if (!response.ok || !/^https?:\/\//.test(short)) throw new Error('respuesta inválida')

      await reply(`» Enlace acortado:\n${short}`)
    } catch {
      await reply('» No se pudo acortar el enlace. Intenta más tarde.')
    }
  }
}
