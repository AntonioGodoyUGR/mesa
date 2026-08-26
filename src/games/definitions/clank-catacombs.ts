import type { GameDefinition } from '../types'

export const clankCatacombs: GameDefinition = {
  slug: 'clank-catacombs',
  name: 'Clank!: Catacombs',
  icon: '💀',
  tagline: 'Construcción de mazo sigilosa por mazmorras que se montan al explorar',
  theme: { primary: '#4a3f6b' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 45, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Suma artefactos, oro, fichas de puntos y secretos. Si mueres en la mazmorra sin escapar, marcas 0' },
    { key: 'escaped', label: '¿Escapaste de la mazmorra?', short: 'Escape', icon: '🚪', type: 'toggle', showInSummary: true, hint: 'Debes salir por una casilla de escape (o que te suban vivo) para puntuar; si mueres en la profundidad no cuenta nada' },
    { key: 'artifact', label: 'Valor del artefacto', short: 'Artefacto', icon: '🏺', type: 'number', min: 0, hint: 'Informativo: valor del artefacto que robaste (obligatorio llevarse al menos uno para ganar)' },
    { key: 'gold', label: 'Oro conseguido', short: 'Oro', icon: '🪙', type: 'number', min: 0, hint: 'Informativo: cada moneda de oro vale 1 PV al final' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '45–90 min',
    setup: [
      'Cada jugador coge un peón, su mazo inicial idéntico de 10 cartas y sus 30 cubos de «clank» (ruido) de su color.',
      'Montad la entrada de la mazmorra con las losetas de inicio; el resto del laberinto se irá construyendo con losetas al explorar.',
      'Preparad la fila de mercado (Reserva y cartas de la Mazmorra), los artefactos, la reserva del Dragón y su bolsa de ira.',
      'Colocad las fichas de secreto, monstruos y tienda por las losetas según sus símbolos.',
    ],
    turn: [
      { name: '1. Jugar la mano', detail: 'Juegas tus 5 cartas para generar habilidad (comprar cartas), botas (moverte) y espadas (luchar).' },
      { name: '2. Explorar y comprar', detail: 'Te mueves por túneles revelando losetas nuevas, compras cartas de la fila y coges oro, secretos y objetos.' },
      { name: '3. Hacer ruido', detail: 'Muchas cartas y movimientos te obligan a poner cubos de clank en la zona de ruido: cuanto más ruido metes, más daño te hará el Dragón.' },
      { name: '4. Ataque del Dragón', detail: 'Cuando aparece un símbolo de dragón, se sacan cubos de la bolsa; los de tu color que salgan son heridas. Con 10 heridas caes.' },
    ],
    scoring: [
      { what: 'Artefacto robado', points: 'su valor impreso (obligatorio llevar uno para puntuar)' },
      { what: 'Oro acumulado', points: '1 PV por moneda' },
      { what: 'Fichas de puntos, secretos y cartas con PV', points: 'su valor' },
      { what: 'Morir en la mazmorra sin haber escapado ni sido rescatado', points: '0 PV totales' },
    ],
    endCondition:
      'La partida entra en su fase final cuando alguien escapa por la superficie o el Dragón mata al primer aventurero; a partir de ahí cada dragón ataca más fuerte. Solo puntúan quienes escapan vivos o son rescatados a tiempo con un artefacto. Gana quien más PV reúna.',
    reminders: [
      'Tienes que robar al menos un artefacto Y salir vivo: quedarte a saquear demasiado hondo es la forma más típica de morir con 0.',
      'El «clank» es un riesgo calculado: mete ruido para avanzar rápido, pero cuantos más cubos tuyos en la bolsa, más te castiga el Dragón.',
      'Bajar es fácil, subir cuesta: reserva movimiento y objetos (mochilas, teletransportes) para la huida.',
      'En Catacombs la mazmorra se construye al explorar: no sabes qué hay detrás, así que valora el riesgo de adentrarte.',
      'Los artefactos más valiosos están más hondo: cuanto mayor el premio, mayor el peligro de no volver.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/356123/clank-catacombs',
    },
  },
}
