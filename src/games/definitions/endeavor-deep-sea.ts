import type { GameDefinition } from '../types'

export const endeavorDeepSea: GameDefinition = {
  slug: 'endeavor-deep-sea',
  name: 'Endeavor: Deep Sea',
  icon: '🌊',
  tagline: 'Explora, construye y compite por el fondo marino con acciones limitadas',
  theme: { primary: '#1a4a6a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma las casillas alcanzadas en las pistas de tecnología, expansión, construcción y exploración al final de la partida' },
    { key: 'exploration', label: 'Zonas exploradas', short: 'Exploración', icon: '🧭', type: 'number', min: 0, showInSummary: true },
    { key: 'buildings', label: 'Estructuras construidas', short: 'Estructuras', icon: '🏗️', type: 'number', min: 0 },
    { key: 'tokens', label: 'Fichas de restricción usadas', short: 'Restricción', icon: '🔒', type: 'number', min: 0, hint: 'Informativo: cuántas de tus fichas están fuera de la reserva, limitando tus acciones futuras' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–90 min',
    setup: [
      'Cada jugador coge su rueda de acciones personal con sus fichas de restricción y su tablero de pistas de progreso.',
      'Monta el mapa modular del fondo marino con las zonas de exploración según el número de jugadores.',
      'Coloca las losetas de tecnología y construcción disponibles en el mercado central.',
      'Reparte a cada jugador su base inicial y sus recursos de partida.',
    ],
    turn: [
      { name: '1. Elegir acción', detail: 'Cada jugador elige una acción de su rueda que aún tenga fichas disponibles: explorar, construir, avanzar en tecnología o expandirse.' },
      { name: '2. Colocar ficha de restricción', detail: 'Al usar una acción, se coloca una ficha en la casilla siguiente de esa acción en la rueda: esa acción no podrá repetirse hasta liberar la ficha.' },
      { name: '3. Resolver la acción', detail: 'Se aplican los efectos: avanzar en las pistas de progreso, colocar presencia en el mapa o desbloquear nuevas losetas.' },
      { name: '4. Liberar fichas', detail: 'Ciertas acciones y edificios permiten recuperar fichas de restricción para poder repetir esa acción más adelante.' },
    ],
    scoring: [
      { what: 'Progreso en cada pista (tecnología, expansión, construcción, exploración)', points: 'Según la casilla alcanzada en cada pista' },
      { what: 'Control de zonas del mapa', points: 'Bonos por presencia mayoritaria en ciertas regiones' },
      { what: 'Objetivos y losetas especiales', points: 'Según lo indicado en cada una' },
    ],
    endCondition:
      'La partida termina cuando se agotan las losetas del mercado o se cumple la condición de fin de era del mapa. Se suma el progreso final en todas las pistas; gana quien tenga más PV.',
    reminders: [
      'Cada acción se queda "bloqueada" tras usarla hasta que liberes su ficha: no agotes todas las acciones de golpe.',
      'Avanzar en las pistas de progreso suele desbloquear beneficios permanentes además de puntos: revisa los hitos antes de decidir dónde avanzar.',
      'El control de zonas del mapa se disputa por presencia: coloca pronto si quieres asegurar una región.',
      'El modo en solitario enfrenta al jugador contra un objetivo de progreso automático.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/396823/endeavor-deep-sea',
    },
  },
}
