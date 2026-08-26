import type { GameDefinition } from '../types'

export const onMars: GameDefinition = {
  slug: 'on-mars',
  name: 'On Mars',
  icon: '🚀',
  tagline: 'Coloniza Marte construyendo una colonia autosuficiente desde la órbita',
  theme: { primary: '#a33f2f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'La posición final de tu marcador en la vía de PV, tras aplicar todos los recuentos y bonos de fin de partida' },
    { key: 'blueprints', label: 'Planos completados', short: 'Planos', icon: '📐', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: planos de colonia que completaste (dan PV al construir el edificio asociado)' },
    { key: 'tech', label: 'Fichas de tecnología', short: 'Tech', icon: '🔬', type: 'number', min: 0, hint: 'Informativo: avances en las vías tecnológicas (agua, aire, energía, comida) que puntúan al final' },
    { key: 'bots', label: 'Robots y colonos', short: 'Colonia', icon: '🤖', type: 'number', min: 0, hint: 'Informativo: robots y colonos activos que sostienen tu colonia y otorgan bonos' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '90–150 min',
    setup: [
      'Montad el tablero de Marte con la colonia central, las vías de recursos (agua, aire, energía, comida) y el tablero de nave en órbita.',
      'Cada jugador coge su color, su nave, sus colonos, sus dos astronautas y sus fondos iniciales.',
      'Repartid las cartas de proyecto, las losetas de plano y las de bonificación, y colocad la reserva de robots.',
      'Ajustad el marcador de la fase de exploración/colonización según el modo de juego elegido.',
    ],
    turn: [
      { name: '1. Elegir zona', detail: 'Mueves tu shuttle entre la nave en órbita y la superficie: donde estés determina qué acciones puedes hacer (arriba compras/planificas, abajo construyes).' },
      { name: '2. Acción principal', detail: 'Realizas una acción de la zona: obtener recursos, contratar, comprar planos o cartas de departamento, construir edificios o mejorar las vías de soporte vital.' },
      { name: '3. Construir la colonia', detail: 'En la superficie gastas recursos y robots para levantar edificios que completan planos y desbloquean bonos y PV.' },
      { name: '4. Soporte vital', detail: 'Vigilas las cuatro vías (agua, aire, energía, comida): mantenerlas altas evita penalizaciones y habilita nuevas acciones.' },
    ],
    scoring: [
      { what: 'Edificios y planos completados', points: 'PV al construir según la loseta' },
      { what: 'Avances en las vías tecnológicas', points: 'PV al final por posición' },
      { what: 'Objetivos y cartas de departamento cumplidas', points: 'PV variable' },
      { what: 'Robots/colonos y recursos finales', points: 'bonos de fin de partida' },
    ],
    endCondition:
      'La partida acaba cuando la colonia alcanza la autosuficiencia (se cruza el umbral de desarrollo) y se completa la ronda. Se hace el recuento final de tecnologías, objetivos y bonos; gana quien tenga más PV.',
    reminders: [
      'Estar en órbita o en la superficie cambia por completo tus acciones: planifica el movimiento del shuttle, porque bajar y subir cuesta tiempo.',
      'No descuides las cuatro vías de soporte vital: si una se queda corta, tu colonia se ahoga y pierdes acciones.',
      'Los robots hacen el trabajo pesado de construir: sin suficientes, no podrás levantar edificios grandes.',
      'Completar planos encadena bonos: coordina qué edificio construyes con los planos que tienes en mano.',
      'Es un Lacerda: casi todo está conectado, así que busca combos donde una acción alimente la siguiente.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/184267/on-mars',
    },
  },
}
