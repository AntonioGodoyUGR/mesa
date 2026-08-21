import type { GameDefinition } from '../types'

export const duneImperium: GameDefinition = {
  slug: 'dune-imperium',
  name: 'Dune: Imperium',
  icon: '🏜️',
  tagline: 'Coloca agentes, construye tu mazo y hazte con el control de Arrakis',
  theme: { primary: '#d17a22' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
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
      min: 0,
      max: 30,
      showInSummary: true,
      hint: 'Se puntúa según avance tu marcador en la pista de PV; la partida acaba en cuanto alguien llega a 10',
    },
    {
      key: 'combat_strength',
      label: 'Fuerza de combate final',
      icon: '⚔️',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 30,
      hint: 'Suma de las tropas desplegadas más los bonus de cartas en la ronda de combate del último turno',
    },
    {
      key: 'alliance_points',
      label: 'PV ganados por alianzas/facciones',
      icon: '🤝',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 15,
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador elige una Casa (Atreides, Harkonnen, Ecaz o Vernius) y recibe su mazo inicial de 10 cartas, 2 agentes, 3 tropas y su tablero de líder.',
      'Se preparan los tableros de facción (Emperador, Bene Gesserit, Espacial/Gremio, Fremen), el mercado de cartas (6 cartas de Imperio bocarriba) y las cartas de Conflicto (se revela 1 según el número de jugadores).',
      'Se coloca la ficha de Primer Jugador y cada uno roba su mano inicial de 5 cartas.',
      'La partida se juega a lo largo de varias rondas, cada una con una fase de Ronda de Agentes y una fase de Ronda de Combate.',
    ],
    turn: [
      {
        name: 'Colocar agentes',
        detail: 'Por turnos, cada jugador coloca 1 agente en un espacio libre del tablero para activar su efecto (jugando también, si quiere, una carta de la mano con ese icono para combinar el efecto). Se repite hasta que todos los jugadores se quedan sin agentes.',
      },
      {
        name: 'Comprar y reclutar',
        detail: 'Con Solaris o Especia puedes comprar cartas del mercado de Imperio (van a tu mazo de descarte) o reclutar tropas/beneficios de las pistas de facción.',
      },
      {
        name: 'Consejo de Landsraad y Alto Consejo',
        detail: 'Algunos espacios permiten firmar leyes del Landsraad o conseguir un asiento en el Alto Consejo, que dan efectos permanentes o puntúan al final.',
      },
      {
        name: 'Ronda de Combate',
        detail: 'Tras la Ronda de Agentes, cada jugador decide en secreto cuántas tropas y qué cartas de combate dedica al conflicto activo. Se revela todo a la vez: de mayor a menor fuerza total se reparten las recompensas de la carta de Conflicto (normalmente PV, Especia o Solaris).',
      },
      {
        name: 'Fin de ronda',
        detail: 'Se descartan las cartas jugadas (menos las persistentes), se roba mano nueva de 5 cartas y avanza el marcador de ronda.',
      },
    ],
    scoring: [
      { what: 'Ganar un conflicto (Ronda de Combate)', points: 'según indique la carta de Conflicto activa, normalmente entre 1 y 3 PV para el primer puesto y menos para el segundo' },
      { what: 'Alcanzar el nivel máximo de alianza con una facción', points: '2 PV, además de acceso a beneficios exclusivos de esa facción' },
      { what: 'Cartas de Imperio y del Alto Consejo con icono de PV', points: 'otorgan puntos directos al jugarlas o al final de la partida, según indique la carta' },
    ],
    endCondition:
      'La partida termina en cuanto un jugador alcanza 10 puntos de victoria (se completa la ronda de combate en curso antes de calcular el ganador). Gana quien tenga más PV; el empate lo rompe quien tenga más Especia.',
    reminders: [
      'Solo puedes tener 2 agentes al principio de la partida: el tercero y cuarto se consiguen con cartas de líder o del Landsraad.',
      'La Persuasión (icono morado) se gasta en la Ronda de Combate para jugar cartas de combate adicionales sin necesitar un agente.',
      'Los espacios de agente ocupados por un rival no se pueden usar hasta la siguiente ronda, salvo que tengas un efecto que lo permita.',
      'El Gusano/Ornitóptero y otras cartas de Imperio de alto coste suelen dar más de un icono a la vez: revisa bien todos los símbolos antes de descartar la jugada por "no encajar".',
      'La Especia y el Agua no se pierden entre rondas, pero el límite de mano si no se controla puede obligarte a descartar cartas al final de la ronda si tu líder no lo indica de otra forma.',
    ],
    officialLink: {
      label: 'Web oficial (Dire Wolf Digital)',
      url: 'https://www.direwolfdigital.com/dune-imperium/',
    },
  },
}
