import type { GameDefinition } from '../types'

export const foodChainMagnate: GameDefinition = {
  slug: 'food-chain-magnate',
  name: 'Food Chain Magnate',
  icon: '🍔',
  tagline: 'Monta la mayor cadena de comida rápida y arruina a la competencia',
  theme: { primary: '#c0392b' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 120, max: 240 },
  difficulty: 'hard',
  scoreLabel: 'Dinero en el banco',
  scoreLabelShort: '$',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'money', label: 'Dinero final en el banco', short: '$', icon: '💵', type: 'number', isTotal: true, showInSummary: true, hint: 'Gana quien tenga más dinero cuando se agota la reserva del banco. Es tu saldo, no puntos' },
    { key: 'milestones', label: 'Hitos conseguidos', short: 'Hitos', icon: '🏁', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: hitos que reclamaste (dan bonos permanentes y a veces bloquean a los rivales)' },
    { key: 'restaurants', label: 'Restaurantes abiertos', short: 'Restaur.', icon: '🏢', type: 'number', min: 0, hint: 'Informativo: número de restaurantes que llegaste a tener en el mapa' },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '120–240 min',
    setup: [
      'Montad el mapa modular con casas, carreteras, fuentes (limonada, cerveza, hamburguesa, pizza) y colocad los restaurantes iniciales de cada jugador.',
      'Cada jugador empieza con su mazo de empresa formado solo por la carta de Director General (CEO).',
      'Colocad la reserva del banco (varía con el número de jugadores), las cartas de empleado disponibles y las losetas de hito.',
      'Preparad el marcador de precios, los jardines/casas y el suministro de comida y bebida.',
    ],
    turn: [
      { name: '1. Reestructurar', detail: 'Formas tu organigrama: colocas tus empleados bajo el CEO respetando la cadena de mando; tu estructura define cuántas acciones puedes hacer esta ronda.' },
      { name: '2. Contratar y formar', detail: 'Usas las ranuras de RRHH y formación para contratar empleados nuevos del mercado o ascenderlos a puestos más potentes.' },
      { name: '3. Trabajar', detail: 'Activas a tus empleados en orden: marketing (crea demanda en las casas), compras de comida/bebida, fijar precios, producción y otras acciones.' },
      { name: '4. Fase de cena', detail: 'Cada casa con demanda compra al restaurante que le ofrezca todos los productos que quiere al menor precio y más cerca; cobras ese dinero. Luego se pagan los sueldos.' },
    ],
    scoring: [
      { what: 'Vender comida y bebida a las casas', points: 'ingresas su precio en dinero' },
      { what: 'Hitos reclamados', points: 'bonos permanentes (marketing gratis, sin sueldos, descuentos...)' },
      { what: 'Pagar sueldos a tus empleados', points: 'te cuesta dinero cada ronda' },
      { what: 'Dinero en el banco al final', points: 'es tu puntuación: el más rico gana' },
    ],
    endCondition:
      'La partida acaba en la ronda en que la reserva del banco se agota (cuando ya no puede pagar del todo a alguien). Gana quien tenga más dinero acumulado. No hay puntos de victoria: solo dinero.',
    reminders: [
      'No hay azar: es un juego de planificación pura y muy competitivo. Un error de estructura se paga carísimo.',
      'El marketing es el motor: sin campañas que generen demanda en las casas, no vendes nada. Piensa a quién llegará tu anuncio.',
      'Los hitos son una carrera: muchos solo los consigue el primero y algunos hunden a los rivales (bajar precios a 0, quitar marketing). Ve a por los que te convengan.',
      'Vigila los sueldos: crecer demasiado rápido puede dejarte sin dinero para pagar a tu plantilla.',
      'La primera partida se hace larga y dura; asumidlo y centraos en entender el ciclo de marketing → demanda → venta.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/175914/food-chain-magnate',
    },
  },
}
