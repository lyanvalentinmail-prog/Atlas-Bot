// ╭────────────────────────────────────────────
// │  ATLAS BOT · Datos de los minijuegos
// │  Palabras, preguntas y pistas (sin emojis).
// ╰────────────────────────────────────────────

// ── Ahorcado / adivina / anagrama ──
export const PALABRAS = [
  'atlas', 'robot', 'teclado', 'ventana', 'montana', 'bicicleta', 'chocolate',
  'elefante', 'internet', 'camiseta', 'biblioteca', 'murcielago', 'helicoptero',
  'mariposa', 'paraguas', 'sandia', 'guitarra', 'astronauta', 'dinosaurio',
  'computadora', 'pirata', 'cohete', 'tijera', 'lampara', 'espejo', 'almohada'
]

export const ADIVINA_PISTAS = [
  { palabra: 'luna', pista: 'Sale de noche y no es una estrella' },
  { palabra: 'hielo', pista: 'Agua fría y dura' },
  { palabra: 'espejo', pista: 'Te devuelve tu imagen' },
  { palabra: 'reloj', pista: 'Marca las horas' },
  { palabra: 'llave', pista: 'Abre puertas' },
  { palabra: 'libro', pista: 'Tiene páginas y capítulos' },
  { palabra: 'tren', pista: 'Viaja sobre rieles' },
  { palabra: 'aguja', pista: 'Pequeña, puntuda y cose' },
  { palabra: 'nube', pista: 'Blanca en el cielo, suelta agua a veces' },
  { palabra: 'puente', pista: 'Une dos orillas' }
]

// ── Trivia / quiz ──
export const TRIVIA = [
  { q: '¿Cuántos planetas tiene el sistema solar?', ops: ['7', '8', '9', '10'], r: 1 },
  { q: '¿Cuál es el océano más grande?', ops: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'], r: 2 },
  { q: '¿En qué país está la Torre Eiffel?', ops: ['Italia', 'Francia', 'España', 'Inglaterra'], r: 1 },
  { q: '¿Cuál es el metal más ligero?', ops: ['Hierro', 'Aluminio', 'Litio', 'Titanio'], r: 2 },
  { q: '¿Qué gas respiramos principalmente?', ops: ['Oxígeno', 'Nitrógeno', 'CO2', 'Hidrógeno'], r: 1 },
  { q: '¿Cuánto es 15 x 4?', ops: ['45', '50', '60', '65'], r: 2 },
  { q: '¿Cuál es el idioma más hablado del mundo por nativos?', ops: ['Inglés', 'Español', 'Mandarín', 'Hindi'], r: 2 },
  { q: '¿Qué año comenzó la Primera Guerra Mundial?', ops: ['1905', '1914', '1918', '1939'], r: 1 },
  { q: '¿Cuál es el animal terrestre más rápido?', ops: ['León', 'Guepardo', 'Caballo', 'Antílope'], r: 1 },
  { q: '¿Qué órgano produce la insulina?', ops: ['Hígado', 'Riñón', 'Páncreas', 'Corazón'], r: 2 },
  { q: '¿Cuántos lados tiene un hexágono?', ops: ['5', '6', '7', '8'], r: 1 },
  { q: '¿Quién pintó la Mona Lisa?', ops: ['Miguel Ángel', 'Rafael', 'Da Vinci', 'Picasso'], r: 2 },
  { q: '¿Cuál es el país más grande del mundo?', ops: ['China', 'EE.UU.', 'Rusia', 'Canadá'], r: 2 },
  { q: '¿Qué vitamina se obtiene del sol?', ops: ['A', 'B', 'C', 'D'], r: 3 },
  { q: '¿Cuál es la raíz cuadrada de 144?', ops: ['10', '11', '12', '14'], r: 2 }
]

// ── Capitales ──
export const CAPITALES = [
  { pais: 'Uruguay', capital: 'montevideo' },
  { pais: 'Argentina', capital: 'buenos aires' },
  { pais: 'Chile', capital: 'santiago' },
  { pais: 'Perú', capital: 'lima' },
  { pais: 'México', capital: 'ciudad de mexico' },
  { pais: 'Colombia', capital: 'bogota' },
  { pais: 'España', capital: 'madrid' },
  { pais: 'Francia', capital: 'paris' },
  { pais: 'Italia', capital: 'roma' },
  { pais: 'Japón', capital: 'tokio' },
  { pais: 'Brasil', capital: 'brasilia' },
  { pais: 'Alemania', capital: 'berlin' }
]

// ── Banderas descritas con colores (sin emojis de banderas) ──
export const BANDERAS = [
  { pais: 'uruguay', desc: 'Sol de mayo y franjas azules y blancas' },
  { pais: 'argentina', desc: 'Dos franjas celestes con blanco y sol en el centro' },
  { pais: 'mexico', desc: 'Verde, blanco y rojo con un águila en el centro' },
  { pais: 'japon', desc: 'Círculo rojo sobre fondo blanco' },
  { pais: 'italia', desc: 'Tres franjas: verde, blanco y rojo' },
  { pais: 'francia', desc: 'Tres franjas verticales: azul, blanco y rojo' },
  { pais: 'brasil', desc: 'Verde con rombo amarillo y círculo azul' },
  { pais: 'canada', desc: 'Hoja de arce roja entre dos franjas rojas' },
  { pais: 'suecia', desc: 'Cruz amarilla sobre fondo azul' },
  { pais: 'suiza', desc: 'Cruz blanca sobre fondo rojo' }
]

// ── Pokémon pistas ──
export const POKEMON_PISTAS = [
  { nombre: 'pikachu', pistas: ['Es tipo eléctrico', 'Es un ratón amarillo', 'Es la mascota más famosa'] },
  { nombre: 'charizard', pistas: ['Tipo fuego/volador', 'Evolución de un lizard naranja', 'Tiene llama en la cola'] },
  { nombre: 'bulbasaur', pistas: ['Tipo planta', 'Tiene un bulbo en la espalda', 'Es el #001'] },
  { nombre: 'squirtle', pistas: ['Tipo agua', 'Es una tortuga azul', 'Lleva gafas en el anime'] },
  { nombre: 'mewtwo', pistas: ['Tipo psíquico', 'Fue creado en laboratorio', 'Es muy poderoso'] },
  { nombre: 'gengar', pistas: ['Tipo fantasma/veneno', 'Color morado', 'Sonrisa traviesa'] },
  { nombre: 'eevee', pistas: ['Tiene muchas evoluciones', 'Color café', 'Tiene collar de pelo blanco'] },
  { nombre: 'snorlax', pistas: ['Duerme casi siempre', 'Muy grande y pesado', 'Bloquea caminos'] }
]

// ── Anime pistas ──
export const ANIME_PISTAS = [
  { nombre: 'naruto', pistas: ['Ninja de hoja', 'Busca ser Hokage', 'Tiene un zorro de 9 colas dentro'] },
  { nombre: 'one piece', pistas: ['Piratas en busca de un tesoro', 'El protagonista estira brazos', 'Sombrero de paja'] },
  { nombre: 'dragon ball', pistas: ['Guerreros con ki', 'Esferas que cumplen deseos', 'Saiyajin'] },
  { nombre: 'death note', pistas: ['Libreta mortal', 'Detective L', 'Shinigami'] },
  { nombre: 'attack on titan', pistas: ['Murallas gigantes', 'Titanes devoran humanos', 'Capos de reconocimiento'] },
  { nombre: 'fullmetal alchemist', pistas: ['Alquimia y equivalente de intercambio', 'Dos hermanos', 'Armadura vacía'] },
  { nombre: 'spy x family', pistas: ['Familia falsa', 'Espía + asesina + telépata', 'Anya'] },
  { nombre: 'kimetsu no yaiba', pistas: ['Cazadores de demonios', 'Katana con agua/fuego', 'Tanjiro'] }
]

// ── Fútbol ──
export const FUTBOL_TRIVIA = [
  { q: '¿Cuántos jugadores por equipo hay en la cancha?', ops: ['10', '11', '12', '9'], r: 1 },
  { q: '¿Qué país ganó el Mundial 2022?', ops: ['Francia', 'Brasil', 'Argentina', 'Alemania'], r: 2 },
  { q: '¿Cuánto dura un partido reglamentario?', ops: ['80 min', '90 min', '100 min', '120 min'], r: 1 },
  { q: '¿Qué significa un hat-trick?', ops: ['2 goles', '3 goles', '4 goles', '5 goles'], r: 1 },
  { q: '¿Qué país tiene más Mundiales ganados?', ops: ['Alemania', 'Argentina', 'Brasil', 'Italia'], r: 2 },
  { q: '¿Qué significa "offside"?', ops: ['Falta', 'Fuera de juego', 'Penal', 'Córner'], r: 1 },
  { q: '¿Quién es conocido como "La Pulga"?', ops: ['Cristiano', 'Neymar', 'Messi', 'Mbappé'], r: 2 },
  { q: '¿De qué color es la tarjeta de expulsión?', ops: ['Amarilla', 'Roja', 'Azul', 'Verde'], r: 1 }
]

// ── Verdadero o falso ──
export const VERDADERO_FALSO = [
  { afirm: 'Los pulpos tienen tres corazones', r: true },
  { afirm: 'La Gran Muralla China se ve desde el espacio a simple vista', r: false },
  { afirm: 'Einstein reprobó matemáticas en la escuela', r: false },
  { afirm: 'Los murciélagos usan ecolocalización', r: true },
  { afirm: 'El oro es más pesado que el plomo', r: true },
  { afirm: 'Los humanos y los dinosaurios coexistieron', r: false },
  { afirm: 'El agua hierve más rápido en la montaña', r: false },
  { afirm: 'Las abejas pueden reconocer rostros humanos', r: true },
  { afirm: 'Júpiter es el planeta más grande del sistema solar', r: true },
  { afirm: 'Los gemelos idénticos tienen huellas dactilares idénticas', r: false }
]

// ── Diccionario simple para scrabble / anagrama ──
export const DICCIONARIO = [
  'amor', 'casa', 'perro', 'gato', 'sol', 'luna', 'mar', 'rio', 'pan', 'sal',
  'luz', 'flor', 'arbol', 'cielo', 'nube', 'estrella', 'camino', 'puerta',
  'ventana', 'libro', 'mesa', 'silla', 'agua', 'fuego', 'tierra', 'aire',
  'mano', 'pie', 'ojo', 'boca', 'nariz', 'oreja', 'corazon', 'mente', 'vida',
  'tiempo', 'dia', 'noche', 'tarde', 'manana', 'amigo', 'familia', 'niño',
  'mujer', 'hombre', 'mundo', 'nombre', 'palabra', 'cosa', 'parte', 'lugar',
  'trabajo', 'juego', 'musica', 'canto', 'baile', 'arte', 'color', 'forma',
  'punto', 'linea', 'numero', 'letra', 'historia', 'cuento', 'poema', 'frase',
  'idea', 'sueno', 'verdad', 'poder', 'fuerza', 'valor', 'paz', 'guerra'
]

export const AHORCADO_FIGURA = [
  '```\n +---+\n     |\n     |\n     |\n    ===\n```',
  '```\n +---+\n O   |\n     |\n     |\n    ===\n```',
  '```\n +---+\n O   |\n |   |\n     |\n    ===\n```',
  '```\n +---+\n O   |\n/|   |\n     |\n    ===\n```',
  '```\n +---+\n O   |\n/|\\  |\n     |\n    ===\n```',
  '```\n +---+\n O   |\n/|\\  |\n/    |\n    ===\n```',
  '```\n +---+\n X   |\n/|\\  |\n/ \\  |\n    ===\n```'
]
