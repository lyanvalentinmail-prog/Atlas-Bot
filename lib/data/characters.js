// ╭────────────────────────────────────────────
// │  ATLAS BOT · Personajes del gacha
// │  Lista de ejemplo con personajes genéricos.
// │  Reemplázalos por los tuyos: solo necesitan
// │  "name" y "rarity" (1 a 4 estrellas).
// │  También puedes agregar "image" (URL) y el
// │  comando !roll enviará la foto automáticamente.
// ╰────────────────────────────────────────────

// Probabilidades por rareza (aprox.):
//   ★ 1 = 55%   ★★ = 33%   ★★★ = 12%   ★★★★ = 2%
export const RARITY_CHANCES = { 1: 53, 2: 32, 3: 13, 4: 2 }

export const CHARACTERS = [
  // ★ Comunes
  { name: 'Aldeana Valiente', rarity: 1 },
  { name: 'Mago Aprendiz', rarity: 1 },
  { name: 'Arquera del Bosque', rarity: 1 },
  { name: 'Gato Parlante', rarity: 1 },
  { name: 'Escudero Novato', rarity: 1 },
  { name: 'Curandera del Río', rarity: 1 },
  // ★★ Raros
  { name: 'Caballera Nocturna', rarity: 2 },
  { name: 'Domadora de Lobos', rarity: 2 },
  { name: 'Ninja del Viento', rarity: 2 },
  // ★★★ Épicos
  { name: 'Hechicera Lunar', rarity: 3 },
  { name: 'Dragón Joven', rarity: 3 },
  // ★★★★ Legendarios
  { name: 'Reina del Trueno', rarity: 4 }
]

// Elige un personaje al azar respetando las probabilidades.
export const rollCharacter = () => {
  const total = Object.values(RARITY_CHANCES).reduce((sum, n) => sum + n, 0)
  let ticket = Math.random() * total
  let rarity = 1
  for (const [r, chance] of Object.entries(RARITY_CHANCES)) {
    ticket -= chance
    if (ticket <= 0) { rarity = Number(r); break }
  }
  const pool = CHARACTERS.filter(c => c.rarity === rarity)
  return pool[Math.floor(Math.random() * pool.length)]
}
