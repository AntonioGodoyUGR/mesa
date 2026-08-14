import type { GameDefinition } from '../types'

export const monopoly: GameDefinition = {
  slug: 'monopoly',
  name: 'Monopoly',
  icon: '🎩',
  tagline: 'Compra media ciudad y arruina a los demás',
  theme: {
    primary: '#1f7a4d',
    accent: '#d64545',
    surface: '#eef7f0',
  },
  minPlayers: 2,
  maxPlayers: 8,
  playTime: { min: 90, max: 180 },
  difficulty: 'easy',
  scoreLabel: 'Patrimonio',
  scoreLabelShort: '€',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'net_worth',
      label: 'Patrimonio final',
      short: 'Patrimonio',
      icon: '💰',
      type: 'number',
      points: 1,
      isTotal: true,
      showInSummary: true,
      hint: 'Dinero + precio de tus solares + casas y hoteles',
    },
    {
      key: 'properties',
      label: 'Solares',
      icon: '🏘️',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 28,
      hint: 'No suma: se guarda como estadística',
    },
    {
      key: 'houses',
      label: 'Casas',
      icon: '🏠',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 32,
    },
    {
      key: 'hotels',
      label: 'Hoteles',
      icon: '🏨',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 12,
    },
    {
      key: 'bankrupt',
      label: 'Quebró',
      icon: '💸',
      type: 'toggle',
      group: 'Registro',
      hint: 'Marca a quien se quedó sin nada antes de acabar',
    },
  ],

  rules: {
    players: '2–8 jugadores',
    duration: '90–180 min',
    setup: [
      'Cada jugador coge una ficha y 1.500 € repartidos en billetes de todos los valores.',
      'Baraja las cartas de Suerte y Caja de Comunidad y déjalas boca abajo en su casilla.',
      'Las escrituras, casas y hoteles se quedan en el banco, ordenadas y a la vista.',
      'Elegid banquero: lleva el dinero del banco aparte del suyo.',
      'Todas las fichas empiezan en la casilla de Salida.',
      'Empieza quien saque el número más alto con los dos dados.',
    ],
    turn: [
      {
        name: '1. Tirar y mover',
        detail:
          'Avanza la suma de los dos dados. Si sacas dobles, repites turno; a los terceros dobles seguidos vas directo a la cárcel.',
      },
      {
        name: '2. Resolver la casilla',
        detail:
          'Si el solar no tiene dueño, lo compras al precio de la escritura o sale a subasta. Si es de otro, le pagas el alquiler (solo si te lo reclama antes de la siguiente tirada).',
      },
      {
        name: '3. Negociar y construir',
        detail:
          'Puedes intercambiar solares y dinero con quien quieras, hipotecar, deshipotecar y construir casas si tienes un color completo.',
      },
    ],
    scoring: [
      { what: 'Solar suelto', points: 'Alquiler base' },
      { what: 'Color completo sin construir', points: 'Alquiler ×2' },
      { what: 'Casas (1 a 4)', points: 'Alquiler creciente' },
      { what: 'Hotel', points: 'Alquiler máximo' },
      { what: 'Estación', points: '25 € × estaciones que tengas' },
      { what: 'Compañía', points: '4 × dados (10 × si tienes las dos)' },
      { what: 'Pasar por Salida', points: '+200 €' },
    ],
    endCondition:
      'Gana el último que queda sin quebrar. Si jugáis con límite de tiempo, gana quien tenga más patrimonio: dinero + precio de compra de sus solares + coste de sus casas y hoteles (los hipotecados valen la mitad).',
    reminders: [
      'Si no compras un solar libre, sale a subasta obligatoriamente y puede quedárselo cualquiera, incluso por 1 €.',
      'Para construir necesitas TODO el color y hay que edificar de forma uniforme: no puedes poner la segunda casa hasta que todos los solares del color tengan una.',
      'Un solar hipotecado no cobra alquiler, y el color completo tampoco dobla si uno de sus solares está hipotecado.',
      'El dinero de las multas no se acumula en el Parking Gratuito: eso es una regla de la casa, no del reglamento.',
      'En la cárcel sigues cobrando alquileres y puedes negociar con normalidad.',
    ],
    officialLink: {
      label: 'Web oficial (Hasbro)',
      url: 'https://www.hasbro.com/en-us/brands/monopoly',
    },
  },
}
