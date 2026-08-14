import type { GameDefinition } from '../types'

export const parchis: GameDefinition = {
  slug: 'parchis',
  name: 'Parchís',
  icon: '🎲',
  tagline: 'Veinte de contar y comer',
  theme: { primary: '#c62828' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 30, max: 60 },
  difficulty: 'easy',
  scoreLabel: 'Fichas en casa',
  scoreLabelShort: 'Casa',
  totalMode: 'computed',
  winnerRule: 'highest',
  targetScore: 4,

  fields: [
    {
      key: 'home',
      label: 'Fichas que llegaron a casa',
      short: 'En casa',
      icon: '🏁',
      type: 'counter',
      points: 1,
      min: 0,
      max: 4,
      showInSummary: true,
    },
    {
      key: 'eaten',
      label: 'Fichas que se comió',
      short: 'Comidas',
      icon: '😋',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 20,
      showInSummary: true,
      hint: 'No suma: se guarda como estadística',
    },
    {
      key: 'was_eaten',
      label: 'Veces que se lo comieron',
      short: 'Comido',
      icon: '💀',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 20,
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '30–60 min',
    setup: [
      'Cada jugador elige un color y pone sus cuatro fichas en su casilla de salida.',
      'Colocad el tablero de forma que cada uno tenga su color delante.',
      'Empieza quien saque el 5 más rápido, o sortead el orden con el dado.',
      'Se juega en el sentido de las agujas del reloj.',
    ],
    turn: [
      {
        name: '1. Tirar el dado',
        detail:
          'Mueve una ficha tantas casillas como marque el dado. Necesitas un 5 para sacar una ficha de la salida.',
      },
      {
        name: '2. Comer',
        detail:
          'Si acabas el movimiento en una casilla ocupada por una sola ficha rival —y no es un seguro—, se la comes: vuelve a su salida y tú avanzas 20 casillas.',
      },
      {
        name: '3. Repetir',
        detail:
          'Sacar un 6 te da otra tirada; a los tres seises seguidos, la ficha que movías vuelve a la salida. Comer da 20 y meter una ficha en casa da 10, y ambos se cuentan aparte del dado.',
      },
    ],
    scoring: [
      { what: 'Sacar ficha de la salida', points: 'Un 5 en el dado' },
      { what: 'Comer una ficha', points: 'Avanzas 20' },
      { what: 'Meter una ficha en casa', points: 'Avanzas 10' },
      { what: 'Sacar un 6', points: 'Tiras otra vez' },
      { what: 'Tres seises seguidos', points: 'La ficha vuelve a la salida' },
      { what: 'Meta de la partida', points: 'Las 4 fichas en casa' },
    ],
    endCondition:
      'Gana quien mete sus cuatro fichas en la casilla central. Si queréis clasificar a todos, seguid jugando hasta que el resto también llegue, o apuntad cuántas fichas tenía cada uno en casa al terminar.',
    reminders: [
      'Dos fichas en la misma casilla forman barrera y nadie puede pasar por encima, ni siquiera tú.',
      'En las casillas de seguro (las grises y las de salida) no se puede comer.',
      'Para entrar en el pasillo final y en la casa hace falta el número exacto; si te pasas, el movimiento no vale.',
      'Si tienes fichas en la salida y sacas un 5, estás obligado a sacar una.',
      'Con solo una ficha fuera, el 6 se mueve como 7 en la variante más extendida: acordadlo antes de empezar.',
    ],
  },
}
