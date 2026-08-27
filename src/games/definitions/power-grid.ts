import type { GameDefinition } from '../types'

export const powerGrid: GameDefinition = {
  slug: 'power-grid',
  name: 'Power Grid',
  icon: '⚡',
  tagline: 'Subastas de centrales y una red eléctrica que alimentar',
  theme: { primary: '#f5a623' },
  minPlayers: 2,
  maxPlayers: 6,
  playTime: { min: 120, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Ciudades abastecidas',
  scoreLabelShort: 'Ciudades',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'cities_powered', label: 'Ciudades abastecidas en la ronda final', short: 'Ciudades', icon: '🏙️', type: 'number', min: 0, isTotal: true, showInSummary: true, hint: 'Cuántas ciudades de tu red puedes alimentar con tus centrales y los recursos que tienes' },
    { key: 'elektro', label: 'Elektro restante', short: 'Elektro', icon: '💰', type: 'number', min: 0, showInSummary: true, hint: 'Dinero que te queda; desempata si hay igualdad de ciudades abastecidas' },
  ],

  rules: {
    players: '2–6 jugadores',
    duration: '~120 min',
    setup: [
      'Elegid mapa (Alemania o el que uséis) y colocad el tablero con sus ciudades y conexiones con coste.',
      'Barajad las cartas de central eléctrica y formad el mercado visible: 4 más baratas en la "fila actual" y 4 más caras en la "fila futura".',
      'Preparad la reserva de recursos (carbón, petróleo, basura, uranio) en el track del tablero y el dinero inicial de cada jugador (50 elektro).',
      'Determinad el orden inicial de turno al azar; ese orden se irá recalculando cada ronda.',
    ],
    turn: [
      { name: '1. Determinar turno', detail: 'Juega primero quien tenga más ciudades en su red (y, en empate, la central de mayor número); ese orden se usa para las fases 2 y 3, e invertido para la 4.' },
      { name: '2. Subastar centrales', detail: 'Por orden de turno, cada jugador puede sacar a subasta una central del mercado (empezando a pujar por su coste mínimo); todos pujan y quien gana se la queda y paga. Quien no saca ninguna esta ronda no puede pujar hasta la siguiente.' },
      { name: '3. Comprar recursos', detail: 'Por orden inverso de turno (el último de la fase 1 compra primero), cada jugador compra carbón, petróleo, basura o uranio del mercado para alimentar sus centrales; el precio sube según lo que va quedando.' },
      { name: '4. Construir', detail: 'Por orden inverso de turno, cada jugador conecta nuevas ciudades a su red pagando el coste de la ciudad más el coste de las conexiones del mapa hasta llegar a ella.' },
      { name: '5. Burocracia', detail: 'Cada jugador gasta los recursos necesarios para hacer funcionar tantas centrales como quiera y cobra el ingreso correspondiente al número de ciudades que abastece; luego se repone el mercado de recursos y, si toca, se reordena el mercado de centrales (retirando la más cara y añadiendo una nueva).' },
    ],
    scoring: [
      { what: 'Ciudades que puedes abastecer en la ronda final', points: 'Determina la posición' },
      { what: 'Elektro que te queda', points: 'Desempate si hay igualdad de ciudades abastecidas' },
    ],
    endCondition:
      'En cuanto un jugador conecta su ciudad número umbral (el número exacto depende del mapa y de cuántos jugadores seáis: cuantos más jugadores, menos ciudades hacen falta para disparar el final) se completa esa ronda entera y termina la partida. Gana quien pueda abastecer más ciudades con sus centrales y recursos disponibles; el elektro restante desempata.',
    reminders: [
      'El orden de turno cambia cada ronda: ir en cabeza en ciudades te hace subastar y construir primero, pero comprar recursos y cobrar el último.',
      'No hace falta tener la central más potente: a veces conviene una que gaste menos recursos o de un tipo menos disputado (o directamente renovable, sin coste de combustible).',
      'El precio de los recursos sube según lo que se compra: comprar en el momento adecuado (o forzar subida a los rivales) es parte del juego.',
      'El juego pasa por "pasos" (Step 2 y Step 3) que cambian las reglas de construcción y el mercado de centrales; suelen dispararse al construir muchas ciudades o al agotar la baraja de centrales.',
      'Tener más ciudades no sirve de nada si no puedes alimentarlas todas: guarda elektro y recursos para la ronda final.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/2651/power-grid',
    },
  },
}
