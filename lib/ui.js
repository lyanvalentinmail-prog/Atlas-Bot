// ╭────────────────────────────────────────────
// │  ATLAS BOT · Sistema de diseño de menús
// │  Cajas, filas, barras y números con un
// │  estilo único para todas las pantallas
// │  del bot (menús, rankings, perfiles...).
// │
// │  Solo símbolos Unicode » nada de emojis.
// ╰────────────────────────────────────────────

// ── « Esqueleto de caja » ────────────────────
// box('TIENDA', [...filas]) =>
// ╭─「 TIENDA 」
// ...filas
// ╰─────────────
export const box = (title, rows, footer) =>
  [
    `╭─「 ${title} 」`,
    ...rows.filter(r => r !== undefined && r !== null),
    '╰─────────────',
    ...(footer ? [footer] : [])
  ].join('\n')

// ── « Filas clave-valor » ────────────────────
// kv('Monedas', '1.250') => │ » Monedas : 1.250
export const kv = (label, value) => `│ » ${label} : ${value}`

// ── « Separador interno » ────────────────────
export const sep = '│─────────────'

// ── « Línea de subtítulo dentro de la caja » ─
export const section = (title) => `│ ・ *${title}*`

// ── « Pista debajo de la caja » ──────────────
export const hint = (text) => `> ${text}`

// ── « Números con separador de miles » ───────
// num(12345) => 12.345
export const num = (n) => {
  const s = String(Math.trunc(Number(n) || 0))
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// ── « Barra de progreso » ────────────────────
// bar(7, 10) => ▰▰▰▰▰▰▰▱▱▱
export const bar = (value, max, len = 10) => {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const filled = Math.round(ratio * len)
  return '▰'.repeat(filled) + '▱'.repeat(Math.max(0, len - filled))
}

// ── « Estrellas de rareza » ──────────────────
// stars(3) => ★★★☆
export const stars = (filled, total = 4) =>
  '★'.repeat(Math.max(0, filled)) + '☆'.repeat(Math.max(0, total - filled))

// ── « Medalla del podio » ────────────────────
// medal(0) => ᯓ (primero), el resto « · »
export const medal = (index) => (index === 0 ? 'ᯓ' : '·')

// ── « Estado on/off » ────────────────────────
export const flag = (on) => (on ? '✔ activado' : '✘ desactivado')

// ── « Lista numerada con viñeta de podio » ───
// rankRows(['a','b','c'], (txt, i) => ...)
export const rankRows = (items, mapFn) =>
  items.map((item, i) => `${medal(i)} ${i + 1}. ${mapFn(item, i)}`)
