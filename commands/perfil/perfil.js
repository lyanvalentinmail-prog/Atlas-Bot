// ╭────────────────────────────────────────────
// │  COMANDO » perfil
// │  Muestra tu perfil: número, monedas,
// │  pokemon y personajes coleccionados.
// │  !perfil  o  !perfil @usuario
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getAccount } from '../../lib/database.js'

export default {
  name: 'profile',
  alias: ['yo', 'perfil'],
  category: 'perfil',
  description: 'Muestra el perfil de un usuario.',
  usage: 'profile [@usuario]',

  run: async ({ sock, msg, chatId, reply, sender, prefix }) => {
    const target = getTargetUser(msg) || sender
    const number = getNumber(target)
    const account = getAccount(target)
    const reg = account.registered

    const caption = [
      `╭─「 PERFIL 」`,
      `│ » Usuario   : @${number}`,
      `│ » ${reg ? `Nombre    : ${reg.name} (${reg.age} años)` : `Registro  : no registrado · ${prefix}register`}`,
      `│ » Número    : +${number}`,
      `│ » Monedas   : ${account.coins}`,
      `│ » Pokemon   : ${account.pokemon.length} atrapados`,
      `│ » Personajes: ${account.characters.length} obtenidos`,
      '╰─────────────'
    ].join('\n')

    // Intenta incluir la foto de perfil; si no se puede, solo texto
    try {
      const picture = await sock.profilePictureUrl(target, 'image')
      await sock.sendMessage(chatId, {
        image: { url: picture },
        caption,
        mentions: [target]
      }, { quoted: msg })
    } catch {
      await reply(caption, { mentions: [target] })
    }
  }
}
