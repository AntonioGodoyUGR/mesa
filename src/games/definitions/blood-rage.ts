import type { GameDefinition } from '../types'

export const bloodRage: GameDefinition = {
  slug: 'blood-rage',
  name: 'Blood Rage',
  icon: '🪓',
  tagline: 'Vikingos en el Ragnarök: morir bien puntúa más que sobrevivir',
  theme: { primary: '#8a1f1f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de gloria',
  scoreLabelShort: 'Gloria',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'glory_total', label: 'Puntos de gloria (total)', short: 'Gloria', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma cartas de misión, invasiones de provincia, monstruos matados, muertes en combate y bonos de clan al final de cada era' },
    { key: 'quests', label: 'Misiones completadas', short: 'Misiones', icon: '📜', type: 'number', min: 0, showInSummary: true },
    { key: 'monsters', label: 'Monstruos derrotados', short: 'Monstruos', icon: '🐉', type: 'number', min: 0 },
    { key: 'provinces', label: 'Provincias invadidas', short: 'Provincias', icon: '🏰', type: 'number', min: 0 },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '60–90 min',
    setup: [
      'Cada jugador elige un clan vikingo, coge su tablero, sus miniaturas y su moneda de Ragnarök.',
      'Monta el tablero de Midgard con sus provincias y coloca los monstruos (Fenrir, Jörmundgander, Surtr) según el número de jugadores.',
      'Baraja el mazo de cartas de cada era (I, II y III) por separado.',
      'Reparte a cada jugador la carta de misión secreta de la era I.',
    ],
    turn: [
      { name: '1. Draft de cartas', detail: 'Cada jugador elige una carta de su mano y la pasa; las cartas dan mejoras, monstruos aliados o cartas de invasión.' },
      { name: '2. Turnos de acción', detail: 'Por turnos, cada jugador realiza una acción: mover un clan, reclutar, invadir una provincia enemiga o jugar una carta de invasión ya elegida.' },
      { name: '3. Batallas', detail: 'Al invadir una provincia con enemigos, se resuelve el combate sumando fuerza de unidades y cartas jugadas en secreto; el perdedor manda a sus unidades al Valhalla (mueren mejor si mueren luchando).' },
      { name: '4. Fin de era', detail: 'Cuando el mazo de la era se agota, se cuenta la gloria de esa era, se resuelve el Ragnarök de la provincia central y se preparan las cartas de la siguiente era.' },
    ],
    scoring: [
      { what: 'Completar tu misión secreta de cada era', points: 'Según lo indicado en la carta' },
      { what: 'Invadir con éxito una provincia', points: '1 gloria por provincia enemiga conquistada' },
      { what: 'Matar un monstruo', points: 'Gloria indicada en su ficha' },
      { what: 'Perder una unidad en combate (Valhalla)', points: '1 gloria por unidad muerta en batalla' },
      { what: 'Bonos de fin de era y cartas especiales', points: 'Según lo impreso en cada carta' },
    ],
    endCondition:
      'La partida se juega en tres eras. Al final de la tercera, tras el Ragnarök final que destruye Midgard, se suma la gloria de las tres eras. Gana quien tenga más gloria total, sin importar cuánto territorio conserves al final.',
    reminders: [
      'Morir en combate no es malo: cada unidad perdida en batalla da gloria, así que atacar aunque pierdas puede compensar.',
      'Las misiones secretas premian objetivos concretos (invadir, perder unidades, jugar cartas de cierto tipo): revísalas antes de planear el turno.',
      'El Ragnarök de fin de era destruye una provincia entera y expulsa a todos los clanes que había en ella.',
      'El draft se hace en simultáneo: elige tu carta y pásala a la vez que los demás, sin ver antes qué han elegido.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/170216/blood-rage',
    },
  },
}
