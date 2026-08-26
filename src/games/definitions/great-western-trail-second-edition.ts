import type { GameDefinition } from '../types'

export const greatWesternTrailSecondEdition: GameDefinition = {
  slug: 'great-western-trail-second-edition',
  name: 'Great Western Trail: Second Edition',
  icon: '🐄',
  tagline: 'El clásico del ganado, reeditado con exhibiciones y trenes retocados',
  theme: { primary: '#9a6b34' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 75, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'buildings', label: 'Edificios propios', short: 'Edificios', icon: '🏚️', type: 'counter', points: 1, min: 0, showInSummary: true, hint: 'Suma los PV impresos de tus edificios privados construidos por el camino' },
    { key: 'railroad', label: 'Estaciones y escudos de ciudad', short: 'Vía', icon: '🚂', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV de tus discos en estaciones y en los escudos de las ciudades del ferrocarril' },
    { key: 'objectives', label: 'Cartas de objetivo', short: 'Objetivos', icon: '🎯', type: 'number', points: 1, showInSummary: true, hint: 'Suma neta de tus objetivos cumplidos, restando los incompletos' },
    { key: 'exhibitions', label: 'Losetas de exhibición', short: 'Exhib.', icon: '🎪', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV de las losetas de exhibición que hayas reclamado (novedad de la 2.ª edición)' },
    { key: 'bonuses', label: 'Bonos varios', short: 'Bonos', icon: '⭐', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Fichas de peligro, trabajadores avanzados, casilla de disco despejada y ficha de mercado laboral, sumado' },
    { key: 'money', label: 'Dinero final', short: 'Dinero', icon: '💵', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Anota ya convertido: 1 PV por cada 5 dólares que te sobren' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '75–150 min',
    setup: [
      'Cada jugador recibe su mazo inicial de ganado, su vaquero al inicio del camino y sus discos de personal y de estación.',
      'Monta el tablero de la 2.ª edición: camino a Kansas City, mercado laboral, mercado de edificios, losetas de exhibición y pilas de peligro/objetivo.',
      'Reparte las cartas de objetivo iniciales y prepara la fila de trabajadores disponible.',
      'Coloca los marcadores de dinero y de tren de cada jugador en su posición inicial.',
    ],
    turn: [
      { name: 'A. Mover el vaquero', detail: 'Avanza tu peón 1 o más pasos por el camino, dentro del límite que te permitan tus cartas jugadas.' },
      { name: 'B. Usar la casilla', detail: 'Ejecuta la acción de la casilla donde acabas (comprar ganado, construir, contratar personal, exhibición...) o una acción auxiliar en vez de moverte.' },
      { name: 'C. Robar cartas', detail: 'Roba de tu mazo hasta tu límite de mano para el siguiente turno.' },
    ],
    scoring: [
      { what: 'Edificios privados construidos', points: 'los PV impresos de cada tesela' },
      { what: 'Discos en estaciones y escudos de ciudad', points: 'los PV que desbloqueen' },
      { what: 'Cartas de objetivo cumplidas', points: 'las indicadas, restando las no completadas' },
      { what: 'Losetas de exhibición reclamadas', points: 'sus PV' },
      { what: 'Fichas de peligro, trabajadores avanzados y otros bonos', points: 'varios bonos menores' },
      { what: 'Dinero sobrante', points: '1 PV por cada 5 dólares' },
    ],
    endCondition:
      'La partida termina cuando un jugador coloca un trabajador en la última casilla del mercado laboral (se lleva su ficha). Se completa esa ronda y se cuentan todas las categorías; gana quien tenga más PV.',
    reminders: [
      'Es la 2.ª edición: los trenes, las estaciones y las exhibiciones cambian respecto a la original, aunque el motor del ganado es el mismo.',
      'Las cartas de objetivo incompletas restan puntos: no acumules más de las que puedas cumplir.',
      'El ganado de mayor valor exige edificios de mayor nivel para entregarlo: no basta con comprar las vacas más caras.',
      'Las exhibiciones se reclaman al llegar a ciertas ciudades cumpliendo requisitos: planifica el recorrido para pillar las buenas antes que los rivales.',
      'Kansas City penaliza si dejas un disco allí sin haber avanzado en el ferrocarril.',
    ],
    officialLink: {
      label: 'Web oficial (Eggertspiele / Plan B)',
      url: 'https://www.eggertspiele.de/',
    },
  },
}
