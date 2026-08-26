import type { GameDefinition } from '../types'

export const duneImperiumUprising: GameDefinition = {
  slug: 'dune-imperium-uprising',
  name: 'Dune: Imperium – Uprising',
  icon: '🪱',
  tagline: 'Coloca agentes, revela tu mano y reclama Arrakis antes que nadie',
  theme: { primary: '#b5651d' },
  minPlayers: 1,
  maxPlayers: 6,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'points', label: 'Puntos de victoria (marcador)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Lee la posición final de tu marcador en el track de PV' },
    { key: 'alliances', label: 'Alianzas conservadas', short: 'Alianzas', icon: '🤝', type: 'counter', min: 0, max: 4, hint: 'Informativo: cada estandarte de alianza que retienes al final vale 1 PV, ya contado en el track' },
    { key: 'spice_must_flow', label: 'Cartas «La especia debe fluir»', short: 'Especia', icon: '💠', type: 'counter', min: 0, hint: 'Informativo: cada una vale 1 PV' },
  ],

  rules: {
    players: '1–6 jugadores (a 6, en dos equipos de 3)',
    duration: '60–120 min',
    setup: [
      'Cada jugador coge un tablero de líder, sus 2 agentes, cubos de PV y su mazo inicial de 10 cartas; baraja y roba 5.',
      'Coloca el tablero central, la fila de Imperio (Bazar) con 6 cartas visibles y los mazos de Intriga, Conflicto y Acecho.',
      'Mezcla el mazo de Conflicto por niveles (I abajo del todo) y revela la primera carta de conflicto de la ronda.',
      'Reparte los marcadores de influencia de las 4 facciones a 0 y coloca los cubos de tropa en la reserva.',
      'Cada uno recibe su carta de líder con su habilidad y su señal de dote inicial.',
    ],
    turn: [
      { name: '1. Fase de agentes', detail: 'Por turnos, despliega un agente en un espacio del tablero (pagando su coste y cumpliendo el icono de facción de tu carta) y resuelve su acción. Sigue hasta que todos hayáis colocado vuestros agentes.' },
      { name: '2. Fase de revelación', detail: 'Revela el resto de tu mano: suma la Persuasión para comprar cartas del Bazar y las Espadas para tu fuerza en el conflicto de esta ronda.' },
      { name: '3. Combate', detail: 'Quien tenga más espadas + tropas en el conflicto gana el primer premio de la carta de Conflicto; el segundo y el tercero para los siguientes. Las tropas usadas vuelven a la guarnición.' },
      { name: '4. Recuperación', detail: 'Descarta la mano y las cartas compradas al descarte, recupera agentes, pasa el primer jugador y revela un nuevo conflicto.' },
    ],
    scoring: [
      { what: 'Alianza con una facción (control al final)', points: '1 PV mientras la conserves' },
      { what: 'Premios de las cartas de Conflicto', points: 'PV variables, sobre todo en los conflictos de nivel III' },
      { what: 'Carta «La especia debe fluir»', points: '1 PV cada una' },
      { what: 'Espacios y cartas que otorgan PV directos', points: 'según su texto' },
      { what: 'Cartas de Intriga de fin de partida', points: 'las que cumplas su condición' },
    ],
    endCondition:
      'La partida termina al acabar la ronda en la que un jugador alcanza 10 PV (o al agotarse el mazo de Conflicto). Gana quien más PV tenga; en empate, decide el que conserve más especia y solari.',
    reminders: [
      'Para colocar un agente en un espacio necesitas que la carta que juegas muestre el icono de esa zona; si no, ese espacio no está disponible.',
      'Subir en el track de una facción hasta la casilla de alianza te da el estandarte, pero otro puede robártelo si te supera.',
      'Las tropas en la guarnición no cuentan para el combate: hay que desplegarlas al conflicto durante la ronda.',
      'Las cartas de Intriga se juegan en el momento que indican (combate, colocación o fin de partida); no las guardes hasta olvidarlas.',
      'A seis jugadores se juega por equipos y los PV son comunes: coordinad quién persigue cada facción.',
    ],
    officialLink: {
      label: 'Web oficial (Dire Wolf)',
      url: 'https://www.direwolfdigital.com/dune-imperium/',
    },
  },
}
