// ╭────────────────────────────────────────────
// │  COMANDO » avatar » foto de perfil de un usuario.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'

export default {
  name: 'avatar',
  alias: ['foto', 'pfp'],
  category: 'perfil',
  description: 'Muestra el avatar de un usuario.',
  usage: 'avatar [@usuario]',

  run: async ({ sock, msg, chatId, reply, sender }) => {
    const target = getTargetUser(msg) || sender

    try {
      const url = await sock.profilePictureUrl(target, 'image')
      await sock.sendMessage(chatId, {
        image: { url },
        caption: `> Avatar de @${getNumber(target)}`,
        mentions: [target]
      }, { quoted: msg })
    } catch {
      await reply('» No pude sacar su foto (privacidad o sin foto).')
    }
  }
}
