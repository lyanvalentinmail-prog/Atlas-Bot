// ╭────────────────────────────────────────────
// │  COMANDO » suerte » % de suerte del día
// │  (determinista por usuario y día).
// ╰────────────────────────────────────────────
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'suerte',
  alias: ['luck', 'suertehoy'],
  category: 'memes',
  description: 'Genera un porcentaje de suerte del día.',
  usage: 'suerte',

  run: async ({ reply, sender }) => {
    const hoy = new Date().toISOString().slice(0, 10)
    const clave = `${getNumber(sender)}|${hoy}`
    let hash = 0
    for (const ch of clave) hash = (hash * 31 + (ch.codePointAt(0) || 0)) >>> 0
    const suerte = hash % 101

    await reply(`> ✿ Tu suerte de hoy: *${suerte}%*\n> (mañana será otra... o quizá no)`)
  }
}
