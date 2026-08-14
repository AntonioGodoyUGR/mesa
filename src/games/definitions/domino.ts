import type { GameDefinition } from '../types'

export const domino: GameDefinition = {
  slug: 'domino',
  name: 'Dominó',
  icon: '🁫',
  tagline: 'Cierra la mano y cuenta los puntos ajenos',
  theme: { primary: '#2f2f38' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 30, max: 60 },
  difficulty: 'easy',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 100,

  fields: [
    {
      key: 'points',
      label: 'Puntos acumulados',
      short: 'Puntos',
      icon: '🏆',
      type: 'number',
      points: 1,
      isTotal: true,
      min: 0,
      showInSummary: true,
      hint: 'Se juega a 100 puntos (o a lo que acordéis)',
    },
    {
      key: 'rounds_won',
      label: 'Manos ganadas',
      short: 'Manos',
      icon: '🁣',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 40,
      showInSummary: true,
    },
    {
      key: 'capicua',
      label: 'Cierres con capicúa',
      short: 'Capicúas',
      icon: '✨',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 20,
      hint: 'Cerrar con una ficha que vale por los dos extremos',
    },
  ],

  rules: {
    players: '2–4 jugadores (lo habitual, dos parejas)',
    duration: '30–60 min',
    setup: [
      'Pon las 28 fichas boca abajo y revuélvelas bien.',
      'Con cuatro jugadores cada uno coge 7 fichas; con dos, 7 cada uno y el resto queda como reserva.',
      'Si jugáis por parejas, los compañeros se sientan enfrentados.',
      'La primera mano la abre quien tenga el doble seis; en las siguientes, quien ganó la anterior.',
    ],
    turn: [
      {
        name: '1. Colocar',
        detail:
          'Encadena una ficha por cualquiera de los dos extremos abiertos, haciendo coincidir los números.',
      },
      {
        name: '2. Pasar',
        detail:
          'Si no tienes ninguna ficha que encaje, pasas (o robas de la reserva si jugáis con ella). Se juega en el sentido de las agujas del reloj.',
      },
      {
        name: '3. Cierre',
        detail:
          'La mano termina en cuanto alguien coloca su última ficha, o cuando la partida se tranca porque nadie puede jugar.',
      },
    ],
    scoring: [
      { what: 'Ganar la mano', points: 'Suma los puntos de las fichas ajenas' },
      { what: 'Partida trancada', points: 'Gana quien menos puntos tenga en la mano' },
      { what: 'Cada ficha en la mano rival', points: 'Su total de puntos' },
      { what: 'Meta de la partida', points: '100 puntos' },
    ],
    endCondition:
      'Se juegan tantas manos como haga falta hasta que un jugador o una pareja llega a 100 puntos. Si la mano se tranca, cuenta los puntos quien tenga menos fichas en la mano; en parejas se suma lo de los dos compañeros.',
    reminders: [
      'Solo se puede colocar por los dos extremos de la fila: los dobles se ponen atravesados pero no abren camino nuevo.',
      'Si puedes jugar, estás obligado a hacerlo: no vale pasar por estrategia.',
      'En parejas está prohibido dar pistas, señas o comentar lo que llevas.',
      'Si la partida se tranca en empate a puntos, la mano se anula o la gana quien la abrió, según lo que acordéis antes de empezar.',
    ],
  },
}
