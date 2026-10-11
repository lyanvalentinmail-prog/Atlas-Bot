// ╭────────────────────────────────────────────
// │  COMANDO » transferir
// │  Envía monedas a otro usuario.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getAccount, saveDatabase } from '../../lib/database.js'

export default {
  name: 'transfer',
  alias: ['pagar', 'pay', 'enviarmonedas', 'transferir'],
  category: 'economia',
  description: 'Transfiere monedas a otro usuario.',
  usage: 'transfer <cantidad> @usuario',

  run: async ({ msg, reply, sender, args, prefix }) => {
    const cantidad = Math.abs(Math.floor(Number(args[0])))
    const destino = getTargetUser(msg)

    if (!cantidad || cantidad <= 0 || !destino || destino === sender) {
      return reply(
        `» Uso: ${prefix}transfer <cantidad> @usuario\n` +
        `» Ejemplo: ${prefix}transfer 100 @alguien`
      )
    }

    const miCuenta = getAccount(sender)
    if (miCuenta.coins < cantidad) {
      return reply(`» Solo tienes ${miCuenta.coins} monedas.`)
    }

    const cuentaDestino = getAccount(destino)

    miCuenta.coins -= cantidad
    cuentaDestino.coins += cantidad
    saveDatabase()

    await reply([
      '> ⇢ TRANSFERENCIA COMPLETA',
      `> Enviaste *${cantidad}* monedas a @${getNumber(destino)}.`,
      `> Tu nuevo saldo: ${getAccount(sender).coins}`
    ].join('\n'), { mentions: [destino] })
  }
}
