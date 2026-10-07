// ╭────────────────────────────────────────────
// │  COMANDO » shell » comandos del sistema.
// ╰────────────────────────────────────────────
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execCb)

export default {
  name: 'shell',
  alias: ['terminal', 'sh'],
  category: 'propietario',
  description: 'Ejecuta comandos del sistema.',
  usage: 'shell <comando>',
  ownerOnly: true,

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}shell <comando>\n» Ejemplo: ${prefix}shell ls -la`)

    if (/rm\s+-rf\s+(\/|\.|~|\*)/i.test(text) || /mkfs|dd\s+if=/i.test(text)) {
      return reply('» Esa instrucción es destructiva y no la ejecuto.')
    }

    try {
      const { stdout, stderr } = await exec(text, {
        cwd: process.cwd(),
        timeout: 20000,
        maxBuffer: 1024 * 1024
      })
      const salida = (stdout + (stderr ? `\n${stderr}` : '')).trim().slice(0, 2000)
      await reply(`> Terminal:\n\`\`\`\n${salida || '(sin salida)'}\n\`\`\``)
    } catch (error) {
      await reply(`> Error:\n\`\`\`\n${String(error.message).slice(0, 800)}\n\`\`\``)
    }
  }
}
