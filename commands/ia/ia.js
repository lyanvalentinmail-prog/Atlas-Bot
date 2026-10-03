// ╭────────────────────────────────────────────
// │  COMANDO » ia
// │  Pregunta a la inteligencia artificial.
// │  Requiere una API key en config.js (sección
// │  "ai") o en el .env:  AI_API_KEY=sk-...
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'ia',
  alias: ['ai', 'chatgpt'],
  category: 'ia',
  description: 'Conversa con la inteligencia artificial.',
  usage: 'ia <texto>',

  run: async ({ reply, text, prefix, config }) => {
    if (!text) return reply(`» Uso: ${prefix}ia <tu pregunta>`)

    if (!config.ai.apiKey) {
      return reply(
        '> La inteligencia artificial aún no está configurada.\n' +
        '> Agrega tu API key en *config.js* (sección *ai*)\n' +
        '> o en el *.env* como `AI_API_KEY`.'
      )
    }

    try {
      const data = await fetchJson(config.ai.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.apiKey}`
        },
        body: JSON.stringify({
          model: config.ai.model,
          messages: [
            { role: 'system', content: config.ai.systemPrompt },
            { role: 'user', content: text }
          ],
          max_tokens: 700
        })
      }, 30000)

      const answer = data?.choices?.[0]?.message?.content?.trim()
      if (!answer) throw new Error('La API no devolvió texto.')

      await reply(`> 〄 *${config.botName} AI*\n\n${answer}`)
    } catch (error) {
      await reply(`» No pude contactar a la IA: ${error.message}`)
    }
  }
}
