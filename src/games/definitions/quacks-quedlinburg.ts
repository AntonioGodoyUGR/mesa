import type { GameDefinition } from '../types'

export const quacksQuedlinburg: GameDefinition = {
  slug: 'quacks-quedlinburg',
  name: 'The Quacks of Quedlinburg',
  icon: '🧪',
  tagline: 'Saca ingredientes de la bolsa hasta que la marmita reviente',
  theme: { primary: '#e8792f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 45, max: 45 },
  difficulty: 'easy',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'Puntos',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'victory_points', label: 'Puntos de victoria totales', short: 'Puntos', icon: '🏆', type: 'number', min: 0, isTotal: true, showInSummary: true, hint: 'Suma de la casilla final en el track de puntos tras las nueve rondas' },
    { key: 'coins', label: 'Monedas restantes', short: 'Monedas', icon: '💰', type: 'number', min: 0, showInSummary: true, hint: 'Desempata si hay igualdad de puntos de victoria' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '45 min',
    setup: [
      'Cada jugador coge su marmita, su bolsa y las mismas 9 fichas iniciales dentro (varias calabazas blancas y unas pocas de otro tipo).',
      'Colocad el dado de bonificación y las fichas de rubí, gotas y sellos.',
      'Preparad los libros de ingredientes en la variante que uséis (recomendado el primero).',
      'El marcador va a la ronda 1 de nueve.',
    ],
    turn: [
      { name: '1. Cocer', detail: 'Sacas fichas de tu bolsa una a una y las colocas en la marmita avanzando según su valor, mientras te atrevas.' },
      { name: '2. ¿Explota?', detail: 'Si las calabazas blancas acumuladas suman más de 7, tu marmita revienta y pierdes parte del turno.' },
      { name: '3. Cobrar', detail: 'Según dónde acabe tu ficha de gota: ganas monedas para comprar ingredientes y puntos de victoria.' },
      { name: '4. Comprar', detail: 'Con las monedas ganadas, compras nuevos ingredientes del libro para meterlos en tu bolsa de cara a las siguientes rondas.' },
    ],
    scoring: [
      { what: 'Casilla final de la gota', points: 'Puntos de victoria + monedas' },
      { what: 'Rubíes y posición', points: 'Bonos según la casilla' },
    ],
    endCondition:
      'Se juegan nueve rondas. Si tu marmita explotó, eliges puntos O monedas, no ambos. Gana quien más puntos de victoria acumule al final; las monedas restantes desempatan.',
    reminders: [
      'Todos sacan fichas a la vez y en secreto: cada uno decide cuándo plantarse.',
      'Explota solo si las blancas SUMAN más de 7 (no basta con contar fichas).',
      'Puedes plantarte antes de reventar y cobrar seguro; arriesgar da más pero puede costarte la ronda.',
      'Los ingredientes comprados van a la bolsa para las rondas siguientes: piensa en el largo plazo.',
    ],
    officialLink: { label: 'Web oficial (North Star Games)', url: 'https://www.northstargames.com/' },
  },
}
