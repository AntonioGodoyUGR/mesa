import type { GameDefinition } from '../types'

export const clankLegacy: GameDefinition = {
  slug: 'clank-legacy',
  name: 'Clank! Legacy: Acquisitions Incorporated',
  icon: '📦',
  tagline: 'Campaña de saqueo con pegatinas: la caja se llena de vuestras historias',
  theme: { primary: '#6b4a9a' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'points_total', label: 'Puntos finales (total)', short: 'Puntos', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Suma oro, artefactos, fichas de maestría, puntos de cartas y bonos de campaña; solo puntúa si escapaste con vida' },
    { key: 'escaped', label: 'Escapó de la mazmorra', short: 'Escapó', icon: '🪜', type: 'toggle', showInSummary: true, hint: 'Informativo: quien cae inconsciente en las profundidades no puntúa esa partida' },
    { key: 'artifacts', label: 'Artefactos rescatados', short: 'Artefactos', icon: '🏺', type: 'counter', min: 0, hint: 'Informativo: cada artefacto vale muchos puntos, pero pesa para escapar' },
    { key: 'gold', label: 'Oro', short: 'Oro', icon: '🪙', type: 'number', min: 0, hint: 'Informativo: cada moneda de oro vale 1 punto' },
  ],

  rules: {
    players: '2–4 jugadores (campaña de 10 partidas)',
    duration: '60–120 min por partida',
    setup: [
      'Cada jugador coge su mazo inicial de 10 cartas, su peón, sus cubos y su tablero de personaje de la Compañía.',
      'Monta el tablero de la partida correspondiente al capítulo de la campaña y coloca la fila de la Reserva (Dungeon Row) con 6 cartas visibles.',
      'Prepara el mazo de la mazmorra, el reloj/marcador de campaña, los artefactos por su valor y la reserva de Clank! (cubos de ruido).',
      'Seguid las instrucciones del libro de campaña para ese capítulo: puede haber pegatinas, sobres y reglas nuevas.',
    ],
    turn: [
      { name: '1. Jugar toda la mano', detail: 'Juega las 5 cartas de tu mano en el orden que quieras y usa sus puntos de Habilidad (comprar), Espada (atacar) y Bota (moverte).' },
      { name: '2. Moverte por la mazmorra', detail: 'Gasta botas para recorrer túneles; algunos exigen luchar contra monstruos o pagar oro. Baja a por artefactos y tesoros.' },
      { name: '3. Comprar y combatir', detail: 'Con Habilidad compras cartas de la Reserva para tu mazo; con Espada derrotas a los monstruos de la fila y de la mazmorra.' },
      { name: '4. Generar Clank!', detail: 'Muchas cartas te obligan a añadir cubos de Clank! a la zona: cuanto más ruido, más daño recibirás cuando el dragón ataque.' },
    ],
    scoring: [
      { what: 'Oro conseguido', points: '1 punto por moneda' },
      { what: 'Artefactos rescatados', points: 'los puntos impresos (más cuanto más profundo)' },
      { what: 'Fichas de maestría y cartas con puntos', points: 'sus valores' },
      { what: 'Bonos y desbloqueos de la campaña', points: 'según el libro de campaña' },
      { what: 'Caer inconsciente sin escapar', points: 'no puntúas: pierdes lo llevado' },
    ],
    endCondition:
      'La partida acaba cuando todos los jugadores han escapado a la superficie o caído inconsciente en las profundidades. Solo quien lleve al menos un artefacto y logre subir puntúa; gana quien más puntos sume, y el resultado se registra en la campaña.',
    reminders: [
      'Es una campaña legacy: pegaréis pegatinas, romperéis cartas y escribiréis en el tablero. Los cambios son permanentes.',
      'Hay que subir un artefacto como mínimo para poder ganar: bajar mucho sin volver no sirve de nada.',
      'El dragón ataca sacando cubos de la bolsa: cuanto más Clank! tuyo haya, más probable es que te haga daño.',
      'Una vez el primer jugador escapa (o alguien cae), empieza la cuenta atrás del dragón: no os quedéis abajo demasiado.',
      'No leáis ni abráis los sobres/cajas de la campaña antes de que el libro os lo indique.',
    ],
    officialLink: {
      label: 'Web oficial (Dire Wolf / Renegade)',
      url: 'https://www.direwolfdigital.com/clank/',
    },
  },
}
