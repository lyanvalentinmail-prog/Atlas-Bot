// ╭────────────────────────────────────────────
// │  COMANDO » exec » instrucción rápida del
// │  sistema (misma lógica que !shell).
// ╰────────────────────────────────────────────
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execCb)

export default {
  name: 'exec',
  alias: ['ejecuta', 'cmd'],
  category: 'propietario',
  description: 'Ejecuta una instrucción administrativa del sistema.',
  usage: 'exec <comando de terminal>',
  ownerOnly: true,

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}exec <comando>\n» Ejemplo: ${prefix}exec pm2 status`)

    // Protección básica: nada de borrar el repo
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
      await reply(`> Salida:\n\`\`\`\n${salida || '(sin salida)'}\n\`\`\``)
    } catch (error) {
      await reply(`> Error:\n\`\`\`\n${String(error.message).slice(0, 800)}\n\`\`\``)
    }
  }
}
