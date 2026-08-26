import type { GameDefinition } from '../types'

export const root: GameDefinition = {
  slug: 'root',
  name: 'Root',
  icon: '🦊',
  tagline: 'Bosque en guerra: cada facción juega a un juego distinto',
  theme: { primary: '#4b7a3f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 90 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (marcador)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Anota tu posición final en el marcador; se gana al llegar a 30 (o antes por dominación)' },
    { key: 'dominance_win', label: '¿Victoria por carta de dominación?', short: 'Dominación', icon: '👑', type: 'toggle', showInSummary: true, hint: 'Informativo: si ganaste jugando una carta de dominación y controlando su zona, no por llegar a 30 PV' },
    { key: 'crafted', label: 'Objetos fabricados', short: 'Objetos', icon: '🔨', type: 'counter', min: 0, hint: 'Informativo: los objetos que fabricaste dan PV y bonos según tu facción' },
  ],

  rules: {
    players: '2–4 jugadores (mejor a 4)',
    duration: '60–90 min',
    setup: [
      'Despliega el tablero del bosque (una cara u otra) con sus claros conectados por caminos y ríos, y coloca las ruinas y los objetos.',
      'Cada jugador elige una facción asimétrica —Marquesa de Gato, Dinastía del Nido, Alianza del Bosque, Vagabundo— y monta su tablero, piezas y reglas propias.',
      'Coloca los edificios y guerreros iniciales de cada facción según sus instrucciones de preparación.',
      'Prepara el mazo compartido, reparte 3 cartas a cada jugador y deja el mazo de dominación/objetos a un lado.',
    ],
    turn: [
      { name: 'Amanecer', detail: 'Fase inicial de tu facción: la Marquesa produce madera, el Nido añade decretos, la Alianza revuelve el pueblo... cada una distinta.' },
      { name: 'Día', detail: 'Realizas tus acciones principales: mover guerreros, atacar, construir, reclutar, fabricar objetos con cartas o cumplir tus objetivos de facción.' },
      { name: 'Anochecer', detail: 'Fase de cierre: puntúas lo que corresponda, robas cartas y preparas el siguiente turno.' },
    ],
    scoring: [
      { what: 'Marquesa de Gato', points: 'PV al construir edificios en el mapa' },
      { what: 'Dinastía del Nido', points: 'PV según la cantidad de nidos en el bosque' },
      { what: 'Alianza del Bosque', points: 'PV al crear bases y por simpatía revuelta' },
      { what: 'Vagabundo', points: 'PV cumpliendo misiones, ayudando y usando objetos' },
      { what: 'Fabricar objetos y retirar edificios enemigos', points: 'PV comunes a todas las facciones' },
    ],
    endCondition:
      'La partida termina en cuanto una facción alcanza 30 puntos de victoria, o cuando alguien gana jugando una carta de dominación y manteniendo el control de su zona. Gana ese jugador; no hay recuento final, se gana en el instante en que se cumple la condición.',
    reminders: [
      'Cada facción puntúa de forma completamente distinta: no juzgues tu avance comparando tu tablero con el del rival.',
      'El combate no elimina jugadores: retira piezas y suele dar PV al atacante y al defensor por cada edificio destruido.',
      'Vigila a quien va líder entre todos: en Root conviene frenar al que puntúa rápido, aunque no sea tu enemigo natural.',
      'Las cartas de dominación convierten una partida de puntos en una de control territorial: úsalas si no llegas a 30 a tiempo.',
      'Fabricar objetos consume cartas del color del claro: administra tu mano entre atacar y craftear.',
    ],
    officialLink: {
      label: 'Web oficial (Leder Games)',
      url: 'https://ledergames.com/products/root-a-game-of-woodland-might-and-right',
    },
  },
}
