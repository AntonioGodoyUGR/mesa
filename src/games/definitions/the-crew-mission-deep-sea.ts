import type { GameDefinition } from '../types'

export const theCrewMissionDeepSea: GameDefinition = {
  slug: 'the-crew-mission-deep-sea',
  name: 'The Crew: Mission Deep Sea',
  icon: '🌊',
  tagline: 'Bazas cooperativas: cumplid las tareas sin poder hablar de vuestras cartas',
  theme: { primary: '#1f4a6b' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 20, max: 45 },
  difficulty: 'medium',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'mission_completed', label: '¿Superasteis la misión?', short: 'Misión', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, ganáis o perdéis en equipo si se cumplen todas las tareas de la misión' },
    { key: 'mission_number', label: 'Número de misión', short: 'Misión nº', icon: '🔢', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: qué misión del cuaderno de campaña estabais jugando' },
    { key: 'attempts', label: 'Intentos usados', short: 'Intentos', icon: '🔁', type: 'number', min: 0, hint: 'Informativo: cuántas veces tuvisteis que reintentar la misión antes de superarla' },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '20–45 min',
    setup: [
      'Barajad las 40 cartas (4 palos del 1 al 9 más 4 submarinos como triunfos) y repartidlas todas entre los jugadores.',
      'Quien tenga el submarino más alto (el 4) es el capitán y empieza la primera baza.',
      'Consultad la misión del cuaderno: indica cuántas fichas de tarea hay que repartir y las reglas especiales de esa partida.',
      'Repartid las cartas de tarea boca arriba y, empezando por el capitán, cada jugador va cogiendo tareas hasta agotarlas.',
    ],
    turn: [
      { name: '1. Repartir tareas', detail: 'Antes de jugar, las cartas de tarea (una carta concreta que alguien debe ganar) se reparten entre el equipo según indique la misión.' },
      { name: '2. Comunicación limitada', detail: 'Cada jugador puede, una vez por misión, señalar una de sus cartas indicando si es la más alta, la más baja o la única de su palo. Nada más se puede decir sobre las manos.' },
      { name: '3. Jugar bazas', detail: 'Se juega como en las cartas clásicas: hay que asistir al palo de salida; los submarinos son triunfo. Gana la baza la carta más alta del palo pedido o el triunfo mayor.' },
      { name: '4. Cumplir tareas', detail: 'Cuando alguien gana en una baza una carta que es su tarea, la completa. Si una tarea la gana quien no debía, la misión se pierde al instante.' },
    ],
    scoring: [
      { what: 'Completar todas las tareas de la misión (respetando su orden si lo exige)', points: 'victoria del equipo' },
      { what: 'Que una carta de tarea la gane el jugador equivocado', points: 'derrota inmediata' },
      { what: 'Quedaros sin cartas con tareas sin cumplir', points: 'derrota' },
    ],
    endCondition:
      'La misión se gana en el momento en que se cumplen todas las tareas asignadas, y se pierde en cuanto una tarea se vuelve imposible. No hay puntos: se supera la misión o no. Se juega en campaña de misiones cada vez más difíciles.',
    reminders: [
      'No se puede hablar de las cartas: solo cada jugador tiene UNA señal por misión (carta más alta/baja/única de su palo). Guardadla para el momento clave.',
      'Pensad el orden de las bazas en equipo: quién gana qué y cuándo es todo el reto.',
      'Los 4 submarinos son triunfos y mandan sobre cualquier palo: contad quién puede tenerlos.',
      'Si la misión exige cumplir tareas en un orden concreto, planificad las bazas para respetarlo.',
      'Es una campaña: id apuntando por qué misión vais en el cuaderno para retomarla otro día.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/324856/the-crew-mission-deep-sea',
    },
  },
}
