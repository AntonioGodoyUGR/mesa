import type { GameDefinition } from '../types'

export const throughTheAges: GameDefinition = {
  slug: 'through-the-ages',
  name: 'Through the Ages: A New Story of Civilization',
  icon: '🏛️',
  tagline: 'Una civilización de la antigüedad al siglo XX, medida en puntos de Cultura',
  theme: { primary: '#3f5c3f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 120, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de Cultura',
  scoreLabelShort: 'Cultura',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'culture',
      label: 'Puntos de Cultura totales',
      short: 'Cultura',
      icon: '🏺',
      type: 'number',
      isTotal: true,
      min: 0,
      showInSummary: true,
      hint: 'El marcador del track de Cultura al terminar la partida, tras resolver los eventos de la Edad III',
    },
    {
      key: 'wonders',
      label: 'Maravillas construidas',
      short: 'Maravillas',
      icon: '🗿',
      type: 'counter',
      min: 0,
      hint: 'Informativo: cada Maravilla completada da un buen empujón de Cultura de una sola vez',
    },
    {
      key: 'wars_won',
      label: 'Guerras ganadas',
      short: 'Guerras',
      icon: '⚔️',
      type: 'counter',
      min: 0,
      hint: 'Informativo: ganar una Agresión roba Cultura al rival',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '2–3 horas',
    setup: [
      'Cada jugador empieza con el mismo gobierno (Despotismo), las mismas cartas iniciales de tecnología civil y militar de la Edad A, y 2 unidades militares básicas.',
      'Se monta la hilera de cartas civiles y militares disponibles para comprar, sacando de la pila de la Edad A.',
      'Se preparan las pilas de cartas de las Edades A, B y C, y el mazo de Eventos de cada Edad.',
      'Cada jugador coloca su marcador en la casilla 0 del track de Cultura.',
    ],
    turn: [
      {
        name: '1. Acciones Civiles',
        detail: 'Con tus acciones civiles (su número depende del gobierno) puedes coger una carta de la hilera, añadir población, construir edificios/Maravillas o mejorar tecnología.',
      },
      {
        name: '2. Acciones Militares',
        detail: 'Con tus acciones militares puedes construir unidades, o declarar una Agresión (guerra) contra otro jugador, que se resuelve en tu turno siguiente.',
      },
      {
        name: '3. Fase de Descarte y Corrupción',
        detail: 'Si te sobran cartas de tu mano (más de 10) debes descartar; las cartas de acción civil/militar no cubiertas al final del turno pueden generar Corrupción y restar Cultura.',
      },
      {
        name: '4. Cambio de Edad y Eventos',
        detail: 'Al agotarse la pila de cartas de una Edad se revela un Evento de esa Edad (afecta a todos, a veces según quién vaya más avanzado) y se pasa a la siguiente Edad.',
      },
    ],
    scoring: [
      { what: 'Producción de Cultura cada turno (por Filósofos, Teatros...)', points: 'sube el track de Cultura de forma continua' },
      { what: 'Maravilla completada', points: 'suma Cultura de una sola vez, según la Maravilla' },
      { what: 'Agresión ganada', points: 'roba Cultura al perdedor' },
      { what: 'Corrupción (cartas civiles/militares sin cubrir con recursos)', points: 'resta Cultura cada turno que persiste' },
      { what: 'Eventos de la Edad III', points: 'dan o quitan Cultura según cómo te haya ido en Ciencia, Producción, Agresiones y Población' },
    ],
    endCondition:
      'La partida termina en cuanto se resuelven todos los Eventos de la Edad III. Gana quien tenga más Puntos de Cultura en ese momento.',
    reminders: [
      'No basta con producir comida y recursos: solo cuenta la Cultura, así que hay que convertir la economía en Cultura tarde o temprano.',
      'La Corrupción castiga tener más cartas de acción de las que puedes cubrir con Felicidad/recursos: vigila el gobierno y la población antes de expandirte de más.',
      'Declarar una Agresión gasta acciones militares ya en el turno de la declaración, y se resuelve en tu turno siguiente: el rival tiene una ronda entera para reforzarse.',
      'Cambiar de gobierno da más acciones por turno: quedarte en Despotismo demasiado tiempo te deja por detrás en ritmo de juego.',
    ],
    officialLink: {
      label: 'Web oficial (Czech Games Edition)',
      url: 'https://czechgames.com/en/through-the-ages/',
    },
  },
}
