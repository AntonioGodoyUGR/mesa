import type { GameDefinition } from '../types'

export const patchwork: GameDefinition = {
  slug: 'patchwork',
  name: 'Patchwork',
  icon: '🧵',
  tagline: 'Un tetris de retales a dos, con botones y tiempo',
  theme: { primary: '#a4508b' },
  minPlayers: 2,
  maxPlayers: 2,
  playTime: { min: 20, max: 30 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'buttons',
      label: 'Botones al acabar',
      short: 'Botones',
      icon: '🔘',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'empty_spaces',
      label: 'Huecos sin tapar',
      short: 'Huecos',
      icon: '🕳️',
      type: 'number',
      points: -2,
      min: 0,
      max: 81,
      showInSummary: true,
      hint: 'Cuenta las casillas vacías: la app resta 2 por cada una',
    },
    {
      key: 'special_tile',
      label: 'Ficha especial 7×7',
      short: 'Ficha 7×7',
      icon: '🏅',
      type: 'toggle',
      points: 7,
      uniquePerMatch: true,
      showInSummary: true,
    },
  ],

  rules: {
    players: '2 jugadores',
    duration: '20–30 min',
    setup: [
      'Cada jugador coge un tablero de manta de 9×9 y cinco botones.',
      'Coloca los retales en círculo alrededor del tablero de tiempo.',
      'Pon el peón neutral justo delante del retal más pequeño.',
      'Ambos peones de tiempo empiezan en la casilla 0.',
      'Deja la ficha especial 7×7 a la vista: solo la consigue uno.',
    ],
    turn: [
      {
        name: 'Juega quien esté más atrás',
        detail:
          'El turno es siempre del jugador cuyo peón esté más atrás en el tablero de tiempo (si coinciden, el de arriba).',
      },
      {
        name: 'Opción A — Comprar un retal',
        detail:
          'Solo puedes elegir entre los tres retales siguientes al peón neutral. Pagas sus botones, avanzas el tiempo que indique y lo coses en tu manta.',
      },
      {
        name: 'Opción B — Avanzar y cobrar',
        detail:
          'Mueves tu peón hasta una casilla por delante del rival y cobras un botón por cada espacio avanzado.',
      },
    ],
    scoring: [
      { what: 'Cada botón que te queda', points: '1 punto' },
      { what: 'Casilla vacía de la manta', points: '−2 puntos' },
      { what: 'Ficha especial 7×7', points: '+7 puntos' },
      { what: 'Pasar por un botón del tiempo', points: 'Ingresas tus botones de la manta' },
    ],
    endCondition:
      'La partida acaba cuando los dos peones llegan al final del tablero de tiempo. Cada uno cuenta sus botones, resta 2 por cada casilla vacía y suma 7 si se llevó la ficha especial. Si hay empate, gana quien haya llegado antes al final.',
    reminders: [
      'Solo puedes mirar los tres retales que hay tras el peón neutral: los demás están fuera de tu alcance ese turno.',
      'Los retales se pueden girar y voltear como quieras, pero no pueden solaparse ni salirse de la manta.',
      'La ficha 7×7 se la lleva el primero que complete un cuadrado de 7×7 casillas: solo hay una.',
      'Si no tienes botones suficientes, no puedes comprar el retal, por mucho que te encaje.',
      'Puedes hacer dos turnos seguidos si sigues estando por detrás del rival en el tablero de tiempo.',
    ],
    officialLink: {
      label: 'Web oficial (Lookout Spiele)',
      url: 'https://lookout-spiele.de/',
    },
  },
}
