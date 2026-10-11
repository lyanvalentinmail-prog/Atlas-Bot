// ╭────────────────────────────────────────────
// │  COMANDO » calendario » mes actual en texto.
// ╰────────────────────────────────────────────

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default {
  name: 'calendar',
  alias: ['cal', 'mes', 'calendario'],
  category: 'utilidades',
  description: 'Genera un calendario mensual.',
  usage: 'calendar [mes] [año]',

  run: async ({ reply, args }) => {
    const hoy = new Date()
    const mes = Math.min(12, Math.max(1, Math.abs(parseInt(args[0], 10)) || hoy.getMonth() + 1))
    const anio = Math.abs(parseInt(args[1], 10)) || hoy.getFullYear()

    const primero = new Date(anio, mes - 1, 1)
    const diasEnMes = new Date(anio, mes, 0).getDate()
    // semana empezando en lunes: 0=lun..6=dom
    const offset = (primero.getDay() + 6) % 7

    const grilla = []
    let fila = Array(offset).fill('．')
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() + 1 && anio === hoy.getFullYear()
      fila.push(String(dia).padStart(2, ' '))
      if (fila.length === 7) { grilla.push(fila.join(' ')); fila = [] }
    }
    if (fila.length) grilla.push(fila.join(' '))

    await reply([
      `*${MESES[mes - 1].toUpperCase()} ${anio}*`,
      'LU MA MI JU VI SA DO',
      '```',
      grilla.join('\n'),
      '```'
    ].join('\n'))
  }
}
