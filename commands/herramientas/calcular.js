// ╭────────────────────────────────────────────
// │  COMANDO » calcular
// │  Calculadora matemática básica.
// │  Solo permite números y operadores (seguro).
// ╰────────────────────────────────────────────

export default {
  name: 'calc',
  alias: ['math', 'calcular'],
  category: 'herramientas',
  description: 'Resuelve una operación matemática.',
  usage: 'calc <operación>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}calc <operación>\n» Ejemplo: ${prefix}calc (8+5)*2`)

    const expression = text.replace(/,/g, '.')

    // Solo números, operadores y signos permitidos: nada de código.
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      return reply('» Solo puedo calcular números y operadores: + - * / % ( )')
    }

    try {
      const raw = Function(`"use strict"; return (${expression})`)() // eslint-disable-line no-new-func
      if (!Number.isFinite(raw)) return reply('» El resultado no es un número válido.')
      const result = Number(raw.toFixed(6)) // máximo 6 decimales

      await reply([
        '╭─「 CALCULADORA 」',
        `│ » Operación : ${expression}`,
        `│ » Resultado : ${result}`,
        '╰─────────────'
      ].join('\n'))
    } catch {
      await reply('» La operación no es válida. Revísala e intenta de nuevo.')
    }
  }
}
