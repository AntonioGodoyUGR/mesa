import type { GameDefinition } from '../types'

export const puertoRico: GameDefinition = {
  slug: 'puerto-rico',
  name: 'Puerto Rico',
  icon: '🌴',
  tagline: 'Elige roles de colono, capitán o alcalde para cultivar y exportar',
  theme: { primary: '#7a6a2f' },
  minPlayers: 3,
  maxPlayers: 5,
  playTime: { min: 90, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'shipping_chips', label: 'Fichas de victoria (envíos)', short: 'Envíos', icon: '🚢', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Las fichas de PV que ganaste enviando mercancías en barcos durante la partida' },
    { key: 'buildings', label: 'PV de edificios', short: 'Edificios', icon: '🏛️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Suma de los PV impresos en todos los edificios construidos en tu ciudad' },
    { key: 'large_buildings', label: 'Bonos de edificios grandes', short: 'Grandes', icon: '⭐', type: 'number', points: 1, min: 0, hint: 'PV extra de los edificios grandes morados (aduana, residencia, fortaleza, ayuntamiento, guildhall) según sus condiciones' },
  ],

  rules: {
    players: '3–5 jugadores',
    duration: '90–150 min',
    setup: [
      'Cada jugador coge un tablero de isla y ciudad, coloca sus plantaciones iniciales (indigo/maíz) y recibe sus doblones de inicio.',
      'Montad el suministro de mercancías (maíz, índigo, azúcar, tabaco, café), los colonos en el barco, los barcos de carga y la casa comercial.',
      'Colocad las losetas de edificio ordenadas por precio y las cartas de rol junto al tablero central.',
      'Repartid las losetas de plantación en la oferta y colocad las fichas de victoria en la reserva.',
    ],
    turn: [
      { name: '1. Elegir rol', detail: 'El gobernador empieza; por turnos cada jugador elige un rol disponible (colono, alcalde, constructor, capataz, comerciante, capitán o buscador de oro) y todos ejecutan su acción, pero quien lo eligió recibe un privilegio extra.' },
      { name: '2. Producir y poblar', detail: 'El colono reparte plantaciones, el alcalde reparte colonos que activan plantaciones y edificios, y el capataz produce mercancías según lo que tengas activo.' },
      { name: '3. Vender y enviar', detail: 'El comerciante vende una mercancía por doblones en la casa comercial; el capitán obliga a enviar mercancías en los barcos, ganando 1 ficha de victoria por bien embarcado.' },
      { name: '4. Construir', detail: 'El constructor permite comprar un edificio (con descuento para quien eligió el rol); los edificios dan producción, ventajas o PV finales.' },
    ],
    scoring: [
      { what: 'Fichas de victoria por envíos', points: 'su valor (1 PV cada una)' },
      { what: 'Edificios construidos', points: 'los PV impresos en cada uno' },
      { what: 'Edificios grandes morados', points: 'PV extra si cumples su condición (colonos, otros edificios...)' },
    ],
    endCondition:
      'La partida acaba al terminar la ronda en que se agotan las fichas de victoria, se llena algún tablero de ciudad de edificios, o no se pueden reponer los colonos del barco. Se suman envíos, edificios y bonos; gana quien tenga más PV.',
    reminders: [
      'Elegir el rol correcto es todo: al elegir uno, se lo das también a los rivales, así que piensa a quién beneficias.',
      'El privilegio del rol (una mercancía extra, un descuento, producir de más) es lo que te distingue de los demás cuando lo eliges tú.',
      'Equilibra producir para enviar (fichas de PV) con construir edificios (PV fijos): centrarte solo en uno suele quedarse corto.',
      'Los colonos son un recurso escaso: un edificio o plantación sin colono no produce nada.',
      'Los edificios grandes morados dan muchos PV al final, pero solo si cumples su condición: planifícalos con tiempo.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/3076/puerto-rico',
    },
  },
}
