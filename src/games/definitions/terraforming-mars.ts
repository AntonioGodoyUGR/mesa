import type { GameDefinition } from '../types'

export const terraformingMars: GameDefinition = {
  slug: 'terraforming-mars',
  name: 'Terraforming Mars',
  icon: '🪐',
  tagline: 'Corporaciones subiendo la temperatura del planeta rojo',
  theme: { primary: '#b3452e' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 90, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'tr',
      label: 'Nivel de terraformación',
      short: 'TR',
      icon: '🌡️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'El marcador rojo del borde del tablero',
    },
    {
      key: 'milestones',
      label: 'Hitos reclamados',
      short: 'Hitos',
      icon: '🏁',
      type: 'counter',
      points: 5,
      min: 0,
      max: 3,
      showInSummary: true,
    },
    {
      key: 'awards',
      label: 'Puntos de premios',
      short: 'Premios',
      icon: '🥇',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: '5 por cada premio ganado y 2 por cada segundo puesto',
    },
    {
      key: 'board',
      label: 'Ciudades y bosques',
      short: 'Tablero',
      icon: '🌲',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: '1 por bosque y 1 por cada bosque contiguo a tus ciudades',
    },
    {
      key: 'cards',
      label: 'Cartas jugadas',
      short: 'Cartas',
      icon: '🃏',
      type: 'number',
      points: 1,
      showInSummary: true,
      hint: 'Puntos impresos y de recursos; algunas restan',
    },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '90–150 min',
    setup: [
      'Coloca los marcadores de oxígeno, temperatura y océanos en su valor inicial.',
      'Reparte dos corporaciones y diez cartas de proyecto a cada jugador: se queda con una corporación y compra las cartas que quiera a 3 megacréditos cada una.',
      'Cada jugador recibe la producción y los recursos que indique su corporación.',
      'Poned a la vista los hitos y premios del tablero elegido.',
      'Con partida corta, acordad de antemano jugar sin fase de investigación.',
    ],
    turn: [
      {
        name: '1. Fase de investigación',
        detail: 'Cada generación empiezas comprando hasta 4 cartas nuevas a 3 megacréditos cada una.',
      },
      {
        name: '2. Acciones',
        detail:
          'Por turnos, haces una o dos acciones: jugar cartas, usar acciones azules, acciones estándar, reclamar un hito o financiar un premio.',
      },
      {
        name: '3. Producción',
        detail:
          'Cuando todos pasan, tu TR se convierte en megacréditos, recoges toda tu producción y empieza la siguiente generación.',
      },
    ],
    scoring: [
      { what: 'Nivel de terraformación (TR)', points: '1 punto por nivel' },
      { what: 'Hito', points: '5 puntos' },
      { what: 'Premio (1.º / 2.º)', points: '5 / 2 puntos' },
      { what: 'Bosque', points: '1 punto' },
      { what: 'Ciudad', points: '1 por bosque contiguo (de quien sea)' },
      { what: 'Cartas con puntos', points: 'Lo que indiquen, positivo o negativo' },
    ],
    endCondition:
      'La partida acaba en la generación en que se completan los tres parámetros globales: oxígeno al 14 %, temperatura a +8 °C y los nueve océanos colocados. Se termina esa generación —incluida la conversión final de plantas en bosques— y se cuenta todo. En caso de empate gana quien tenga más megacréditos.',
    reminders: [
      'Subir un parámetro global sube tu TR, y eso son puntos e ingresos cada generación.',
      'Solo se pueden reclamar tres hitos y financiar tres premios en toda la partida.',
      'Financiar un premio cuesta 8, 14 y 20 megacréditos según el orden, y lo puede ganar cualquiera, incluido quien no lo pagó.',
      'La producción de megacréditos puede bajar a −5; las demás nunca bajan de 0.',
      'Los requisitos de una carta se comprueban al jugarla; después da igual que cambien.',
    ],
    officialLink: {
      label: 'Web oficial (FryxGames)',
      url: 'https://www.fryxgames.se/',
    },
  },
}
