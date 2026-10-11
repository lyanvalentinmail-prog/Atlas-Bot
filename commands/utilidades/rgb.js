// ╭────────────────────────────────────────────
// │  COMANDO » rgb » hex ⇄ RGB.
// ╰────────────────────────────────────────────

export default {
  name: 'rgb',
  alias: ['color', 'hexcolor'],
  category: 'utilidades',
  description: 'Convierte colores entre RGB y hexadecimal.',
  usage: 'rgb <#aabbcc>  o  rgb <r> <g> <b>',

  run: async ({ reply, text, args, prefix }) => {
    const limpio = text.replace('#', '').trim()

    // hex » RGB
    const hexMatch = limpio.match(/^[0-9a-fA-F]{6}$/)
    if (hexMatch) {
      const num = parseInt(limpio, 16)
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
      return reply(`> #${limpio.toUpperCase()} = rgb(${r}, ${g}, ${b})`)
    }

    // RGB » hex
    const nums = args.map(n => parseInt(n, 10))
    if (nums.length >= 3 && nums.slice(0, 3).every(n => !Number.isNaN(n) && n >= 0 && n <= 255)) {
      const [r, g, b] = nums
      const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase()
      return reply(`> rgb(${r}, ${g}, ${b}) = *${hex}*`)
    }

    await reply(`» Uso:\n» ${prefix}rgb #7A6CFF\n» ${prefix}rgb 122 108 255`)
  }
}
