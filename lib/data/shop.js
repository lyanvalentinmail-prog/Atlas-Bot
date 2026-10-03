// ╭────────────────────────────────────────────
// │  ATLAS BOT · Objetos de la tienda
// │  Se muestran con !tienda y se compran con
// │  !comprar <id>. Se venden con !vender.
// ╰────────────────────────────────────────────

export const ITEMS = [
  {
    id: 'ticket',
    name: 'Ticket dorado',
    price: 250,
    desc: 'Un ticket coleccionable sin efecto... por ahora.',
    symbol: '✦'
  },
  {
    id: 'escudo',
    name: 'Escudo de robo',
    price: 500,
    desc: 'Demuestra que proteges tus monedas.',
    symbol: '▣'
  },
  {
    id: 'llave',
    name: 'Llave maestra',
    price: 800,
    desc: 'Para presumir ante tus amigos.',
    symbol: '⚿'
  },
  {
    id: 'medalla',
    name: 'Medalla de oro',
    price: 1200,
    desc: 'Puro lujo virtual.',
    symbol: 'Θ'
  },
  {
    id: 'gema',
    name: 'Gema brillante',
    price: 2500,
    desc: 'La joya de la corona del grupo.',
    symbol: '◆'
  },
  {
    id: 'corona',
    name: 'Corona legendaria',
    price: 5000,
    desc: 'El objeto más caro de la tienda.',
    symbol: '♕'
  }
]

export const findItem = (idOrName) => {
  const q = String(idOrName).toLowerCase()
  return ITEMS.find(i => i.id === q || i.name.toLowerCase().includes(q))
}

export const shopText = () => [
  '╭─「 TIENDA 」',
  ...ITEMS.map(i => `│ ${i.symbol} ${i.name} ▸ ${i.price} monedas\n│   ⁝ ${i.desc}\n│   ⁝ ID: ${i.id}`),
  '╰─────────────',
  '> Compra con: !comprar <id>'
].join('\n')
