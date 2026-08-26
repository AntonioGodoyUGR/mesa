import type { GameDefinition } from '../types'

export const ticketToRideLegacyLegendsWest: GameDefinition = {
  slug: 'ticket-to-ride-legacy-legends-west',
  name: 'Ticket to Ride Legacy: Legends of the West',
  icon: '🚂',
  tagline: 'Campaña legacy de rutas de tren que evoluciona partida a partida',
  theme: { primary: '#7a4a2f' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 60, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma rutas, billetes completados, bonos de campaña y penalizaciones por billetes fallidos' },
    { key: 'routes', label: 'PV por rutas tendidas', short: 'Rutas', icon: '🛤️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: puntos de las rutas colocadas (más largas, más puntos)' },
    { key: 'tickets', label: 'Billetes completados', short: 'Billetes', icon: '🎫', type: 'number', min: 0, hint: 'Informativo: billetes de destino cumplidos (los no cumplidos restan sus puntos)' },
    { key: 'campaign_bonus', label: 'Bonos de campaña', short: 'Campaña', icon: '⭐', type: 'number', hint: 'Informativo: PV de pegatinas, cartas y bonos permanentes desbloqueados en la campaña' },
  ],

  rules: {
    players: '2–5 jugadores (grupo fijo durante la campaña)',
    duration: '60–90 min por partida',
    setup: [
      'Es una campaña de 12 partidas: abrid la caja/sobre que indique el diario de campaña, no destapéis nada antes de tiempo.',
      'Montad el mapa del momento con sus rutas; cada jugador coge sus vagones, sus cartas de tren iniciales y su nombre de compañía.',
      'Repartid billetes de destino y descartad según las reglas de esa partida; guardad los objetivos que decidáis conservar.',
      'Aplicad las pegatinas, cartas y reglas nuevas que la campaña haya desbloqueado en partidas anteriores.',
    ],
    turn: [
      { name: '1. Robar cartas de tren', detail: 'Coges 2 cartas de tren (de la fila visible o del mazo); las locomotoras visibles cuentan como dos.' },
      { name: '2. Tender una ruta', detail: 'O, en vez de robar, colocas vagones en una ruta entre dos ciudades descartando las cartas del color y número requeridos, y anotas sus PV.' },
      { name: '3. Coger billetes', detail: 'O robas nuevos billetes de destino (guardando al menos uno): dan PV si conectas las dos ciudades, pero restan si no lo logras.' },
      { name: '4. Elementos de campaña', detail: 'Según la partida, se desbloquean pegatinas, ciudades, mercancías o eventos que cambian el mapa y las reglas para las siguientes partidas.' },
    ],
    scoring: [
      { what: 'Rutas tendidas', points: 'según su longitud (rutas largas, muchos más PV)' },
      { what: 'Billetes de destino completados', points: 'sus puntos; los fallidos los restan' },
      { what: 'Bonos y objetivos de la campaña', points: 'PV variables desbloqueados' },
      { what: 'Ruta continua más larga u otros bonos del mapa', points: 'según la partida' },
    ],
    endCondition:
      'Cada partida acaba cuando a un jugador le quedan 2 o menos vagones; se juega una última ronda y se cuentan los PV. La campaña avanza a lo largo de 12 partidas encadenadas en las que el mapa y las reglas evolucionan de forma permanente.',
    reminders: [
      'Es LEGACY: pegaréis pegatinas, romperéis cartas y escribiréis en el material. Jugad siempre con el mismo grupo.',
      'No abráis sobres ni destapéis contenidos antes de que la campaña os lo indique: parte de la gracia es la sorpresa.',
      'Los billetes no cumplidos restan: no acaparéis objetivos que no vayáis a poder conectar.',
      'Bloquear una ruta clave a un rival sigue siendo tan válido como en el Aventureros al Tren clásico.',
      'Anotad al final de cada partida los desbloqueos y el estado de la campaña por si tardáis en retomarla.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/390788/ticket-to-ride-legacy-legends-of-the-west',
    },
  },
}
