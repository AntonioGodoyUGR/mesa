import type { GameDefinition } from '../types'

export const scrabble: GameDefinition = {
  slug: 'scrabble',
  name: 'Scrabble',
  icon: '🔤',
  tagline: 'Palabras cruzadas por puntos',
  theme: { primary: '#8a6a3d' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 45, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos finales',
      short: 'Puntos',
      icon: '🔤',
      type: 'number',
      points: 1,
      isTotal: true,
      showInSummary: true,
      hint: 'Ya con el ajuste de las fichas que quedaban en el atril',
    },
    {
      key: 'bingos',
      label: 'Palabras de siete fichas',
      short: 'Scrabbles',
      icon: '💥',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 20,
      hint: 'Cada una da +50 puntos, ya incluidos arriba',
    },
    {
      key: 'best_word',
      label: 'Mejor jugada',
      short: 'Mejor',
      icon: '⭐',
      type: 'number',
      group: 'Registro',
      min: 0,
      hint: 'Puntos de la palabra más cara que colocaste',
    },
  ],

  tools: [{ kind: 'timer', seconds: 120, label: 'Reloj de turno' }],

  rules: {
    players: '2–4 jugadores',
    duration: '45–90 min',
    setup: [
      'Mete las 100 fichas en la bolsa y mézclalas.',
      'Cada jugador saca una ficha: empieza quien tenga la letra más cercana a la A (el comodín gana a todo).',
      'Devolved esas fichas a la bolsa y cada uno se pone siete en su atril.',
      'Poned a mano un diccionario acordado de antemano: es el que resuelve las dudas.',
      'La primera palabra tiene que pasar por la casilla central.',
    ],
    turn: [
      {
        name: '1. Colocar',
        detail:
          'Forma una palabra en horizontal o vertical (nunca en diagonal ni al revés) que enlace con alguna ficha ya puesta.',
      },
      {
        name: '2. Contar',
        detail:
          'Suma el valor de todas las palabras nuevas que hayas formado, incluidas las que se crean de refilón al pegar tu palabra a otra.',
      },
      {
        name: '3. Reponer',
        detail:
          'Coge de la bolsa hasta volver a tener siete fichas. En lugar de jugar puedes cambiar fichas o pasar, pero pierdes el turno.',
      },
    ],
    scoring: [
      { what: 'Letra', points: 'Su valor impreso' },
      { what: 'Casilla de letra doble o triple', points: '×2 / ×3 a esa letra' },
      { what: 'Casilla de palabra doble o triple', points: '×2 / ×3 a la palabra entera' },
      { what: 'Primera palabra (casilla central)', points: 'Palabra ×2' },
      { what: 'Usar las siete fichas', points: '+50 puntos' },
      { what: 'Fichas que te sobran al final', points: '−su valor' },
      { what: 'Si alguien se queda sin fichas', points: '+ lo que sobre a los demás' },
    ],
    endCondition:
      'La partida acaba cuando alguien coloca su última ficha y la bolsa está vacía, o cuando todos pasan dos veces seguidas. Cada jugador resta el valor de las fichas que le sobran; quien se quedó sin ninguna suma todo eso a su marcador.',
    reminders: [
      'Las casillas de bonificación solo cuentan el turno en que se cubren; después son casillas normales.',
      'El comodín vale 0 puntos siempre, aunque esté en una casilla de letra triple.',
      'La bonificación de letra se aplica antes que la de palabra.',
      'Si una jugada forma varias palabras, se puntúan todas, y las casillas de bonificación cuentan en cada una.',
      'Nada de nombres propios, abreviaturas ni palabras con guion o apóstrofo.',
    ],
    officialLink: {
      label: 'Web oficial (Hasbro)',
      url: 'https://scrabble.hasbro.com/en-us',
    },
  },
}
