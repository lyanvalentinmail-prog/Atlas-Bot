// ╭────────────────────────────────────────────
// │  ATLAS BOT · Motor de minijuegos con estado
// │  Guarda el juego activo de cada chat y
// │  reparte los mensajes entrantes al juego.
// │  Un juego es: { name, data, onInput(ctx) }
// │  » onInput devuelve true si consumió el msg.
// ╰────────────────────────────────────────────

const games = new Map() // chatId -> juego activo

const MAX_AGE = 10 * 60 * 1000 // 10 min sin actividad » se cierra solo

export const getGame = (chatId) => {
  const game = games.get(chatId)
  if (!game) return null
  if (Date.now() - game.updatedAt > MAX_AGE) {
    games.delete(chatId)
    return null
  }
  return game
}

export const startGame = (chatId, game) => {
  games.set(chatId, { ...game, createdAt: Date.now(), updatedAt: Date.now() })
}

export const endGame = (chatId) => games.delete(chatId)

export const touchGame = (chatId) => {
  const game = games.get(chatId)
  if (game) game.updatedAt = Date.now()
}
