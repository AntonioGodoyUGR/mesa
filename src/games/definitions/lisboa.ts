import type { GameDefinition } from '../types'

export const lisboa: GameDefinition = {
  slug: 'lisboa',
  name: 'Lisboa',
  icon: '🌊',
  tagline: 'Reconstruir Lisboa tras el terremoto de 1755',
  theme: { primary: '#2a5a7a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma edificios reconstruidos, favores de la corte, títulos nobiliarios y bonos de comercio, menos deudas pendientes' },
    { key: 'buildings', label: 'Edificios reconstruidos', short: 'Edificios', icon: '🏛️', type: 'number', min: 0, showInSummary: true },
    { key: 'titles', label: 'Títulos y favores de corte', short: 'Títulos', icon: '👑', type: 'number', min: 0 },
    { key: 'debts', label: 'Deudas sin pagar', short: 'Deudas', icon: '💸', type: 'number', min: 0, hint: 'Informativo: cada deuda pendiente resta puntos al final' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–180 min',
    setup: [
      'Cada jugador coge su tablero personal con su barco, disco de acción y reserva inicial de recursos.',
      'Monta el tablero central con el mapa de Lisboa, la corte, el mercado de comercio y las losetas de terremoto/reconstrucción.',
      'Reparte las cartas de personaje o disco de la reina según el número de jugadores.',
      'Coloca los marcadores de favor y las pilas de recursos (ladrillo, mármol, vidrio, oro) en la reserva general.',
    ],
    turn: [
      { name: '1. Colocar disco de acción', detail: 'Cada jugador mueve su disco por la rueda de acciones de su tablero, avanzando el número de espacios que decida y ejecutando la acción donde se detiene.' },
      { name: '2. Comerciar y reconstruir', detail: 'Usa recursos para reconstruir edificios en el mapa de Lisboa, cada uno con su coste y su recompensa en PV, favores o dinero.' },
      { name: '3. Enviar el barco', detail: 'El barco viaja para traer recursos exóticos o completar rutas comerciales que dan bonos.' },
      { name: '4. Pedir favores a la corte', detail: 'Gasta el favor acumulado para obtener beneficios especiales de la reina o de la iglesia.' },
    ],
    scoring: [
      { what: 'Cada edificio reconstruido', points: 'PV según el edificio y su posición en el mapa' },
      { what: 'Favores y títulos de la corte', points: 'PV indicados en cada carta o loseta' },
      { what: 'Rutas comerciales completadas', points: 'Bonos según la ruta' },
      { what: 'Deudas contraídas y no saldadas', points: '−PV según la cantidad pendiente' },
    ],
    endCondition:
      'La partida termina cuando se agota el mazo de rondas o se reconstruye todo el mapa, según el modo elegido. Se suman los PV de edificios, corte y comercio, y se restan las deudas pendientes; gana quien más PV tenga.',
    reminders: [
      'El disco de acción avanza siempre hacia delante: planifica la ruta con varias rondas de antelación.',
      'Pedir dinero prestado da liquidez inmediata pero resta puntos si no lo devuelves antes del final.',
      'Cada edificio reconstruido puede desbloquear bonos para los edificios vecinos: fíjate en el mapa antes de elegir dónde construir.',
      'El modo en solitario usa un autómata que compite por los mismos edificios del mapa.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/218603/lisboa',
    },
  },
}
