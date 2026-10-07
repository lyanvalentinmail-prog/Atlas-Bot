// ╭────────────────────────────────────────────
// │  COMANDO » ai
// │  Pregunta a la inteligencia artificial.
// │  » Con API key (.env AI_API_KEY): usa tu
// │    endpoint OpenAI-compatible (config.js/ai).
// │  » Sin key: usa Pollinations Text (gratis,
// │    sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'ai',
  alias: ['ia', 'chatgpt', 'asistente'],
  category: 'ia',
  description: 'Conversa con la inteligencia artificial.',
  usage: 'ai <texto>',

  run: async ({ reply, text, prefix, config }) => {
    if (!text) return reply(`» Uso: ${prefix}ai <tu pregunta>`)

    // ── Opción 1: tu API OpenAI-compatible ──
    if (config.ai.apiKey) {
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
        return await reply(`> 〄 *${config.botName} AI*\n\n${answer}`)
      } catch {
        // Si falla tu key, seguimos con la gratuita:
      }
    }

    // ── Opción 2 (sin key): Pollinations Text, gratuita ──
    try {
      const system = encodeURIComponent(
        'Eres Atlas Bot, un asistente amable que responde en español, de forma breve y clara.'
      )
      const respuesta = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(text)}?system=${system}`,
        { signal: AbortSignal.timeout(40000) }
      )
      const answer = (await respuesta.text()).trim()
      if (!answer) throw new Error('sin texto')

      await reply(`> 〄 *${config.botName} AI*\n\n${answer.slice(0, 2000)}`)
    } catch {
      await reply('» No pude contactar a la IA ahora. Intenta más tarde.')
    }
  }
}
