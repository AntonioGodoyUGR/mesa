import type { GameDefinition } from '../types'

export const camelUp: GameDefinition = {
  slug: 'camel-up',
  name: 'Camel Up',
  icon: '🐪',
  tagline: 'Apuesta por camellos que se montan unos encima de otros',
  theme: { primary: '#956c1b' },
  minPlayers: 3,
  maxPlayers: 8,
  playTime: { min: 20, max: 30 },
  difficulty: 'easy',
  scoreLabel: 'Monedas',
  scoreLabelShort: '🪙',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'coins',
      label: 'Monedas',
      icon: '🪙',
      type: 'number',
      isTotal: true,
      min: 0,
      max: 200,
      showInSummary: true,
      hint: 'Monedas al final de la carrera',
    },
    {
      key: 'leg_bets',
      label: 'Apuestas de etapa',
      icon: '🎫',
      type: 'number',
      group: 'Desglose (opcional)',
      min: -20,
      max: 200,
    },
    {
      key: 'race_bets',
      label: 'Apuestas de carrera',
      icon: '🏁',
      type: 'number',
      group: 'Desglose (opcional)',
      min: -20,
      max: 200,
    },
    {
      key: 'pyramid_tickets',
      label: 'Fichas de pirámide',
      icon: '🔺',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 60,
    },
    {
      key: 'desert_tiles',
      label: 'Casillas de desierto',
      icon: '🏜️',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 60,
    },
  ],

  // La pirámide suelta un dado de tres caras cada vez.
  tools: [{ kind: 'dice', count: 1, faces: 3, label: 'Dado de la pirámide' }],

  rules: {
    players: '3–8 jugadores',
    duration: '20–30 min',
    setup: [
      'Monta la pirámide de dados y coloca el tablero de la pista.',
      'Tira los 5 dados de camello y coloca cada camello en la casilla 1, 2 o 3 según su resultado. Si caen en la misma casilla, se apilan.',
      'Cada jugador recibe 3 monedas, su loseta de desierto (oasis por una cara, espejismo por la otra) y su abanico de cartas de apuesta de carrera.',
      'Apila las losetas de apuesta de etapa por colores, con el valor 5 arriba.',
    ],
    turn: [
      {
        name: 'Elige UNA de estas 4 acciones',
        detail: 'En tu turno haces una sola acción y pasas al siguiente jugador.',
      },
      {
        name: 'A · Sacar un dado de la pirámide',
        detail:
          'Mueve ese camello tantas casillas como indique el dado y coges 1 moneda. Los camellos que estén encima viajan con él.',
      },
      {
        name: 'B · Apostar por la etapa',
        detail:
          'Coge la loseta superior de la pila de un camello. Cuanto antes apuestas, más vale.',
      },
      {
        name: 'C · Colocar tu loseta de desierto',
        detail:
          'En una casilla vacía que no sea la de salida ni esté pegada a otra loseta de desierto. Oasis (+1) o espejismo (−1).',
      },
      {
        name: 'D · Apostar por el final de la carrera',
        detail:
          'Pon una de tus cartas boca abajo en la pila de ganador o en la de perdedor. Solo una carta por camello.',
      },
    ],
    scoring: [
      { what: 'Sacar un dado de la pirámide', points: '+1' },
      { what: 'Apuesta de etapa · camello 1.º de la etapa', points: '+5 / +3 / +2 según la loseta' },
      { what: 'Apuesta de etapa · camello 2.º de la etapa', points: '+1' },
      { what: 'Apuesta de etapa fallada', points: '−1' },
      { what: 'Otro camello pisa tu loseta de desierto', points: '+1' },
      { what: 'Apuesta de carrera acertada, por orden de la pila', points: '+8 / +5 / +3 / +2 / +1' },
      { what: 'Apuesta de carrera fallada', points: '−1 por carta' },
    ],
    endCondition:
      'La etapa acaba cuando se han sacado los 5 dados: se pagan las apuestas de etapa, se devuelven dados y losetas y empieza otra. La carrera acaba en cuanto un camello cruza la línea de meta: entonces se pagan las apuestas de ganador y perdedor. Gana quien tenga más monedas.',
    reminders: [
      'Un camello arrastra a todos los que lleva encima; los de debajo se quedan.',
      'Va en cabeza el camello que esté más adelantado y, dentro de un montón, el que esté más arriba.',
      'Con un oasis (+1) el camello se coloca ENCIMA del montón; con un espejismo (−1) se coloca DEBAJO.',
      'Tu loseta de desierto no puede estar en la casilla de salida ni junto a otra loseta de desierto.',
      'Las apuestas de etapa se resuelven cada etapa; las de carrera, solo al final.',
      'Nunca bajas de 0 monedas: si tienes que pagar y no puedes, te quedas a 0.',
    ],
    officialLink: {
      label: 'Reglamento oficial (Pretzel Games)',
      url: 'https://www.pretzelgames.com/en/camel-up',
    },
  },
}
