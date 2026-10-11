// ╭────────────────────────────────────────────
// │  COMANDO » uuid » identificador aleatorio.
// ╰────────────────────────────────────────────
import { randomUUID } from 'node:crypto'

export default {
  name: 'uuid',
  alias: ['guid', 'idrandom'],
  category: 'utilidades',
  description: 'Genera un identificador UUID aleatorio.',
  usage: 'uuid',

  run: async ({ reply }) => {
    await reply(`> UUIDv4:\n> ${randomUUID()}`)
  }
}
