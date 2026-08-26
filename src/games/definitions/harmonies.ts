import type { GameDefinition } from '../types'

export const harmonies: GameDefinition = {
  slug: 'harmonies',
  name: 'Harmonies',
  icon: '🍃',
  tagline: 'Apila fichas de colores para crear paisajes y atraer animales',
  theme: { primary: '#4a8a5a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 30, max: 45 },
  difficulty: 'easy',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'animals', label: 'Cartas de animal', short: 'Animales', icon: '🦉', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV por los cubos de animal colocados en tus cartas, según el progreso completado en cada una' },
    { key: 'trees', label: 'Árboles (bosques)', short: 'Árboles', icon: '🌳', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV por cada ficha de copa de árbol según su altura: 1/3/7 por copa a altura 1/2/3' },
    { key: 'mountains', label: 'Montañas', short: 'Montañas', icon: '⛰️', type: 'number', points: 1, min: 0, hint: 'PV por fichas de montaña apiladas y adyacentes entre sí: 1/3/7 según su altura' },
    { key: 'water', label: 'Ríos (agua)', short: 'Agua', icon: '💧', type: 'number', points: 1, min: 0, hint: 'PV por la longitud de tus cadenas de fichas de agua conectadas' },
    { key: 'fields', label: 'Campos', short: 'Campos', icon: '🌾', type: 'number', points: 1, min: 0, hint: 'PV por grupos de exactamente 2 fichas de campo adyacentes (5 PV cada pareja)' },
    { key: 'buildings', label: 'Edificios', short: 'Edificios', icon: '🏠', type: 'number', points: 1, min: 0, hint: 'PV por edificios rodeados de al menos 3 colores distintos de terreno' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '30–45 min',
    setup: [
      'Cada jugador coge su tablero personal de casillas hexagonales y su ayuda de puntuación.',
      'Montad la reserva central con las fichas de color (verde=árbol, gris=montaña, azul=agua, amarillo=campo, rojo=edificio, marrón=tierra) en la bolsa.',
      'Rellenad los espacios centrales de oferta con grupos de 3 fichas sacadas de la bolsa.',
      'Revelad las cartas de animal disponibles y dad a cada jugador su mano inicial de cartas de animal.',
    ],
    turn: [
      { name: '1. Coger fichas', detail: 'Eliges uno de los grupos de 3 fichas de la oferta central y te lo llevas.' },
      { name: '2. Colocar y apilar', detail: 'Colocas esas 3 fichas en tu tablero respetando las reglas de apilado (las montañas se apilan alto, los árboles van sobre tierra, etc.).' },
      { name: '3. Coger carta de animal (opcional)', detail: 'Puedes tomar una carta de animal de la oferta; cada carta pide un patrón de colores concreto para ir colocando sus cubos.' },
      { name: '4. Progresar animales', detail: 'Si tu tablero cumple el patrón de una de tus cartas de animal, colocas un cubo de animal sobre ella avanzando su puntuación.' },
    ],
    scoring: [
      { what: 'Árboles', points: '1/3/7 PV por copa a altura 1/2/3' },
      { what: 'Montañas apiladas y adyacentes', points: '1/3/7 PV según altura' },
      { what: 'Ríos (cadenas de agua)', points: 'PV crecientes por longitud' },
      { what: 'Campos', points: '5 PV por cada pareja de exactamente 2 fichas adyacentes' },
      { what: 'Edificios rodeados de 3+ colores', points: 'PV por edificio válido' },
      { what: 'Cartas de animal completadas', points: 'los PV impresos según cubos colocados' },
    ],
    endCondition:
      'La partida acaba cuando se agotan las fichas de la bolsa o alguien no puede rellenar la oferta (o al llenar tu tablero en solitario). Se puntúan los paisajes y las cartas de animal; gana quien reúna más PV.',
    reminders: [
      'Cada tipo de terreno puntúa de forma distinta: piensa qué paisaje priorizas antes de coger fichas.',
      'Las cartas de animal te obligan a reservar ciertos colores en cierta forma: no cojas más animales de los que puedas alimentar con tu tablero.',
      'Las montañas solo puntúan si están apiladas Y adyacentes a otras montañas: agrúpalas, no las disperses.',
      'Los campos puntúan en parejas exactas de 2: tres campos juntos valen menos que dos parejas separadas.',
      'El espacio es limitado; equilibra terrenos que puntúan solos con los que rellenan patrones de animal.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/414317/harmonies',
    },
  },
}
