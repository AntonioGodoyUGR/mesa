import type { GameDefinition } from '../types'

export const scythe: GameDefinition = {
  slug: 'scythe',
  name: 'Scythe',
  icon: '⚙️',
  tagline: 'Mechas diésel y granjas en una Europa del Este alternativa',
  theme: { primary: '#7a5230' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 90, max: 115 },
  difficulty: 'hard',
  scoreLabel: 'Monedas',
  scoreLabelShort: '$',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'coins_total', label: 'Monedas finales (total)', short: 'Monedas', icon: '🪙', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Suma: monedas en mano + (estrellas + territorios + cada 2 recursos) × el valor de tu nivel de popularidad + bono de estructuras' },
    { key: 'stars', label: 'Estrellas colocadas', short: 'Estrellas', icon: '⭐', type: 'counter', min: 0, max: 6, showInSummary: true, hint: 'Informativo: cada estrella vale monedas según tu popularidad' },
    { key: 'territories', label: 'Territorios controlados', short: 'Territorios', icon: '🗺️', type: 'counter', min: 0, hint: 'Informativo: cuenta los hexágonos con tus unidades (los túneles cuentan)' },
    { key: 'popularity', label: 'Nivel de popularidad', short: 'Popul.', icon: '❤️', type: 'number', min: 0, max: 18, hint: 'Informativo: decide cuánto vale cada estrella, territorio y par de recursos (0–6, 7–12 o 13–18)' },
    { key: 'structure_bonus', label: 'Bono de estructuras', short: 'Estruct.', icon: '🏭', type: 'number', min: 0, hint: 'Informativo: monedas de la loseta de bono según dónde estén tus 4 estructuras' },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '90–115 min',
    setup: [
      'Reparte a cada jugador un tablero de facción y un tablero de jugador (combinación aleatoria) con sus recursos, popularidad y monedas iniciales.',
      'Coloca tus obreros en los dos hexágonos junto a tu base y tu personaje en la base.',
      'Prepara el tablero central, la fila de cartas de encuentro, las losetas de fábrica y las cartas de objetivo.',
      'Cada jugador roba su combate/objetivos iniciales y coloca sus 6 estrellas y sus fichas de estructura junto a su tablero.',
    ],
    turn: [
      { name: '1. Elegir una sección', detail: 'Coloca tu marcador en una de las cuatro secciones de tu tablero (distinta a la del turno anterior).' },
      { name: '2. Acción de arriba', detail: 'Opcional: Mover/Ganar, Comerciar, Producir o Fortalecer, según la sección elegida.' },
      { name: '3. Acción de abajo', detail: 'Opcional: pagando su coste en recursos, Desplegar mecha, Construir estructura, Reclutar o Mejorar. Cuanto más a la izquierda pagas, más barato sale con el tiempo.' },
      { name: '4. Colocar estrella', detail: 'Al alcanzar un hito (6 poderes de combate, todos los mechas, todas las estructuras, 16 de popularidad, ganar un combate, etc.) pones una de tus 6 estrellas en el track de fin de partida.' },
    ],
    scoring: [
      { what: 'Cada estrella colocada', points: '3 / 4 / 5 monedas según tu nivel de popularidad' },
      { what: 'Cada territorio controlado', points: '2 / 3 / 4 monedas según tu popularidad' },
      { what: 'Cada 2 recursos sobre tus territorios', points: '1 / 2 / 3 monedas según tu popularidad' },
      { what: 'Monedas en mano', points: 'su valor en monedas' },
      { what: 'Bono de estructuras', points: 'lo que indique la loseta según la posición de tus estructuras' },
    ],
    endCondition:
      'La partida acaba en cuanto un jugador coloca su 6.ª estrella. Ese jugador cobra su bono de fin y todos convierten estrellas, territorios y recursos en monedas según su popularidad. Gana quien tenga más monedas en total.',
    reminders: [
      'La popularidad no da puntos por sí sola: multiplica el valor de tus estrellas, territorios y recursos, así que subirla tarde cambia mucho la cuenta final.',
      'Ganar combates cuesta popularidad si expulsas obreros del hexágono: a veces conviene no pelear.',
      'Solo puedes colocar una estrella de cada tipo (salvo las de combate y objetivo): no puedes rematar la partida repitiendo el mismo hito.',
      'No repitas sección: el marcador no puede volver a la casilla del turno anterior.',
      'Los recursos sueltos en el mapa solo puntúan si están sobre territorios que controlas al final.',
    ],
    officialLink: {
      label: 'Web oficial (Stonemaier Games)',
      url: 'https://stonemaiergames.com/games/scythe/',
    },
  },
}
