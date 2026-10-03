// ╭────────────────────────────────────────────
// │  COMANDO » reto
// │  Retos para "verdad o reto".
// ╰────────────────────────────────────────────

const RETOS = [
  'Envía una nota de voz cantando la canción más cursi que sepas.',
  'Cambia tu nombre del grupo por algo ridículo durante 10 minutos.',
  'Escribe "soy muy divertido" 5 veces seguidas.',
  'Habla con acento durante los próximos 3 mensajes.',
  'Elogia a los últimos 3 miembros que escribieron.',
  'Comparte la última foto de tu galería (si es segura).',
  'Escribe tu próximo mensaje al revés.',
  'Dile a alguien del grupo por qué lo quieres.',
  'Manda un audio imitando a un animal.',
  'Pide un consejo absurdo y síguelo al pie de la letra.',
  'Envía un mensaje usando solo emojis... esto es broma: solo símbolos.',
  'Confiesa algo vergonzoso de tu infancia.',
  'Cuenta un chiste malo y no digas que es un chiste.',
  'Déjale un sticker bonito a la persona que mandó el mensaje anterior.',
  'Envía un audio de 5 segundos riendo sin motivo.'
]

export default {
  name: 'dare',
  alias: ['reto'],
  category: 'juegos',
  description: 'Reto aleatorio de "verdad o reto".',
  usage: 'dare',

  run: async ({ reply }) => {
    const reto = RETOS[Math.floor(Math.random() * RETOS.length)]
    await reply(`> ★ R E T O :\n> ${reto}`)
  }
}
