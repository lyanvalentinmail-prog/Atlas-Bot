// ╭────────────────────────────────────────────
// │  COMANDO » perfil
// │  Tarjeta de usuario: registro, monedas,
// │  nivel, rep y colecciones.
// │  !perfil  o  !perfil @usuario
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getAccount } from '../../lib/database.js'
import { box, kv, hint, num } from '../../lib/ui.js'

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

    const caption = box(`PERFIL DE @${number}`, [
      kv('Usuario', `@${number}`),
      kv('Registro', reg
        ? `*${reg.name}* (${reg.age} años) ✔`
        : `sin registrar ・ ${prefix}register`),
      ...(account.bio ? [kv('Bio', account.bio)] : []),
      kv('Monedas', `*${num(account.coins)}* ・ banco: ${num(account.bank)}`),
      kv('Nivel', `${account.level} ・ ${num(account.exp)} exp`),
      kv('Reputación', `${account.rep} pts`),
      kv('Pareja', account.marriage ? `@${account.marriage.partner} ♡` : 'ninguna'),
      '│─────────────',
      kv('Pokemon', `${account.pokemon.length} atrapados`),
      kv('Personajes', `${account.characters.length} obtenidos`),
      kv('Objetos', `${account.items.length} en inventario`)
    ], hint(`${prefix}level ・ ${prefix}inventory ・ ${prefix}mypokemon`))

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
