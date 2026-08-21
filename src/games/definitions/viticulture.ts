import type { GameDefinition } from '../types'

export const viticulture: GameDefinition = {
  slug: 'viticulture',
  name: 'Viticulture Essential Edition',
  icon: '🍇',
  tagline: 'Un viñedo toscano: planta, vendimia y cumple pedidos',
  theme: { primary: '#5e2a52' },
  minPlayers: 1,
  maxPlayers: 6,
  playTime: { min: 45, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos finales',
      icon: '🎯',
      type: 'number',
      isTotal: true,
      min: -5,
      max: 50,
      showInSummary: true,
      hint: 'Lo que marque tu ficha de corcho en la vía de puntuación al terminar el año',
    },
    {
      key: 'wine_orders',
      label: 'Pedidos de vino cumplidos',
      icon: '📜',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 20,
      hint: 'Cada carta de pedido indica cuántos PV da y qué renta anual de liras deja',
    },
    {
      key: 'buildings',
      label: 'Estructuras construidas',
      icon: '🏗️',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 10,
      hint: 'Bodega, prensa, molino de agua, torre de vigilancia y demás mejoras de tu finca',
    },
    {
      key: 'tiebreak_value',
      label: 'Liras + valor de bodega y prensa',
      icon: '💰',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 60,
      hint: 'Solo hace falta si hay empate a puntos al final de la partida',
    },
  ],

  rules: {
    players: '1–6 jugadores (mejor a partir de 3)',
    duration: '45–90 min',
    setup: [
      'Cada jugador recibe un tablero de finca con 3 cartas de campo, una carta "mamá" y una "papá" al azar que reparten trabajadores y recursos iniciales.',
      'La mamá da 2 trabajadores normales y cartas; el papá da 1 trabajador grande, liras y una estructura o recursos extra a elegir.',
      'Se coloca el gallo en la casilla 1 del marcador de despertar y el corcho en la casilla 0 de la vía de puntuación.',
      'Se preparan los mazos de cartas de vid, visitante (verano e invierno) y pedido de vino, y el tablero central con las acciones de cada estación.',
    ],
    turn: [
      {
        name: 'Primavera',
        detail: 'Todos colocan su gallo a la vez en el marcador de despertar (posiciones 1 a 7). Las posiciones más tardías dan mejores bonus (cartas, liras o PV) a cambio de jugar más tarde el resto del año.',
      },
      {
        name: 'Verano',
        detail: 'Por orden de despertar, cada jugador coloca un trabajador en una acción de verano: plantar vides, construir una estructura, robar carta de vid, jugar carta de visitante, dar visitas guiadas por liras o vender campos. Quien pasa no puede colocar más trabajadores esa estación.',
      },
      {
        name: 'Otoño',
        detail: 'No hay colocación de trabajadores: todos roban simplemente una carta de visitante de otoño.',
      },
      {
        name: 'Invierno',
        detail: 'Igual que verano pero con las acciones de invierno: vendimiar campos, hacer vino, cumplir pedidos de vino, robar carta de pedido o formar nuevos trabajadores.',
      },
    ],
    scoring: [
      { what: 'Cumplir un pedido de vino', points: 'los PV indicados en la carta, más una renta de liras cada año siguiente (máx. 5 liras/año en total)' },
      { what: 'Algunas cartas de visitante', points: 'dan PV directos al jugarlas' },
      { what: 'Despertar en la posición 6', points: '1 PV de bonus' },
    ],
    endCondition:
      'En cuanto un jugador llega a 20 PV, se termina de jugar el año en curso y gana quien más puntos tenga. Empates se resuelven por más liras, luego por valor de la bodega, luego por valor de la prensa.',
    reminders: [
      'Cada campo solo se vendimia una vez por año; el valor de uva se suma entre todas las vides apiladas en ese campo.',
      'El trabajador grande puede ocupar una acción ya ocupada por otro trabajador, cosa que los normales no pueden hacer.',
      'El vino y la uva envejecen +1 de valor cada año (tope 9 y según capacidad de la bodega/prensa).',
      'Al final del año hay que descartar hasta quedarte con 7 cartas en mano como máximo.',
      'La vía de puntuación tiene un suelo de −5: ninguna carta puede bajarte de ahí.',
    ],
    officialLink: {
      label: 'Web oficial (Stonemaier Games)',
      url: 'https://stonemaiergames.com/games/viticulture/',
    },
  },
}
