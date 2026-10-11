// ╭────────────────────────────────────────────
// │  COMANDO » pokedex
// │  Información de cualquier pokemon
// │  (PokeAPI, gratuita y sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

const TYPES_ES = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada'
}

export default {
  name: 'pokedex',
  alias: ['poke', 'pokemon'],
  category: 'pokemon',
  description: 'Busca un pokemon en la Pokedex.',
  usage: 'pokedex <nombre o número>',

  run: async ({ sock, msg, chatId, reply, args, prefix }) => {
    const query = (args[0] || '').toLowerCase().trim()
    if (!query) return reply(`» Uso: ${prefix}pokedex <nombre o número>\n» Ejemplo: ${prefix}pokedex pikachu`)

    try {
      const p = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`)

      const stats = Object.fromEntries(p.stats.map(s => [s.stat.name, s.base_stat]))
      const caption = [
        `╭─「 POKEDEX ・ #${String(p.id).padStart(3, '0')} 」`,
        `│ » Nombre    : ${p.name[0].toUpperCase() + p.name.slice(1)}`,
        `│ » Tipo      : ${p.types.map(t => TYPES_ES[t.type.name] || t.type.name).join(' / ')}`,
        `│ » Altura    : ${p.height / 10} m`,
        `│ » Peso      : ${p.weight / 10} kg`,
        '│─────────────',
        `│ » HP ${stats.hp} ・ ATK ${stats.attack} ・ DEF ${stats.defense} ・ VEL ${stats.speed}`,
        '╰─────────────'
      ].join('\n')

      const sprite = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default
      if (sprite) {
        await sock.sendMessage(chatId, { image: { url: sprite }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply(`» No encontré el pokemon *${query}*. Revisa el nombre o número.`)
    }
  }
}
