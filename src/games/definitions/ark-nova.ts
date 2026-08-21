import type { GameDefinition } from '../types'

export const arkNova: GameDefinition = {
  slug: 'ark-nova',
  name: 'Ark Nova',
  icon: '🦁',
  tagline: 'Diseña tu zoo: atractivo y conservación tienen que cruzarse para puntuar',
  theme: { primary: '#3d6b2f' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 90, max: 150 },
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
      min: -14,
      max: 100,
      showInSummary: true,
      hint: 'Tu Atractivo final menos el valor de Atractivo más bajo de la zona donde cayó tu Conservación',
    },
    {
      key: 'appeal',
      label: 'Atractivo final',
      icon: '✨',
      type: 'number',
      group: 'Desglose (opcional)',
      min: -20,
      max: 150,
    },
    {
      key: 'conservation',
      label: 'Puntos de Conservación final',
      icon: '🌱',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 25,
      hint: 'Los primeros 10 valen 2 PV cada uno; a partir del 11, valen 3 PV cada uno',
    },
    {
      key: 'reputation',
      label: 'Reputación final',
      icon: '⭐',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 15,
      hint: 'No puntúa directamente, es informativa',
    },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '90–150 min',
    setup: [
      'Cada jugador elige un mapa de zoo (el Mapa A es el recomendado para primeras partidas) y recibe sus 5 cartas de Acción (Construir, Cartas, Animales, Asociación, Patrocinadores) por el lado I.',
      'Coloca su marcador de Atractivo escalonado según el orden de turno (0, 1, 2, 3), su marcador de Conservación a 0 y su marcador de Reputación al inicio de su pista.',
      'Recibe 25 monedas, 7 fichas de trabajador para su mapa, 4 trabajadores de asociación (1 activo, 3 inactivos) y roba 2 cartas de Puntuación Final (ocultas) y 8 cartas de Zoo, quedándose 4 en mano y descartando 4 bocarriba.',
      'Se coloca el marcador de Pausa en la casilla según el número de jugadores, y se prepara el expositor común de 6 cartas de Zoo.',
    ],
    turn: [
      {
        name: 'Elegir una carta de Acción',
        detail: 'Cada turno juegas una de tus 5 cartas de Acción. Su posición en tu fila (1 a 5) determina su fuerza X: cuanto más tiempo lleve sin usarse, más fuerte es. Al jugarla, vuelve a la posición 1 y las demás se desplazan.',
      },
      {
        name: 'Construir',
        detail: 'Construye 1 recinto de tamaño máximo X, pagando 2 monedas por espacio. El primer edificio debe tocar el borde del mapa; los siguientes deben ser adyacentes a los tuyos.',
      },
      {
        name: 'Animales',
        detail: 'Juega hasta X cartas de animal de tu mano (según tabla de fuerza), comprobando condiciones (zoo asociado, continente, categoría), pagando su coste y colocándolos en un recinto del tamaño y tipo adecuado. Cada animal avanza tu Atractivo.',
      },
      {
        name: 'Asociación',
        detail: 'Con trabajadores de asociación, gana Reputación, un zoo asociado, una universidad o apoya un proyecto de conservación, según la fuerza de la carta.',
      },
      {
        name: 'Patrocinadores',
        detail: 'Juega 1 carta de Patrocinador con nivel igual o menor a tu fuerza, o avanza el marcador de Pausa y recibe dinero.',
      },
      {
        name: 'Cartas',
        detail: 'Avanza el marcador de Pausa 2 espacios y roba cartas del mazo (hasta el número que indique la tabla de fuerza) o, con fuerza 5+, coge directamente 1 carta del expositor.',
      },
    ],
    scoring: [
      { what: 'Jugar animales y construir pabellones', points: 'suben tu Atractivo (cada animal indica cuánto en su carta; cada pabellón, +1)' },
      { what: 'Apoyar proyectos de conservación y donaciones', points: 'suben tu Conservación' },
      { what: 'Puntuación final', points: 'Atractivo total menos el Atractivo más bajo de la zona donde haya caído tu Conservación; los primeros 10 puntos de Conservación valen 2 PV cada uno, y el resto, 3 PV cada uno; se parte de una base de −14' },
    ],
    endCondition:
      'La partida acaba en cuanto los marcadores de Atractivo y Conservación de un jugador se cruzan o coinciden en la misma zona de puntuación (si pasa en tu turno, los demás juegan un turno más antes de puntuar; si pasa en una Pausa, todos juegan un turno más, tú incluido). Gana quien más puntos de victoria tenga; el empate lo rompe quien haya apoyado más proyectos de conservación.',
    reminders: [
      'Si tu Atractivo no llega a cruzar tu Conservación, tu puntuación final puede salir negativa: hace falta cruzarlos para puntuar en positivo.',
      'El límite de mano (normalmente 3 cartas) solo se comprueba en las Pausas, no durante los turnos.',
      'Los fichas X solo pueden usarse en la SIGUIENTE acción, nunca en la misma en la que se consiguen.',
      'El expositor de cartas de Zoo solo se rellena al terminar tu turno completo, no a mitad de acción.',
      'Solo puedes tener un Terrario y un Gran Aviario por zoo; el resto de animales de esos tipos van a un recinto estándar.',
    ],
    officialLink: {
      label: 'Web oficial (Feuerland Spiele)',
      url: 'https://www.feuerland-spiele.de/spiele/arche-nova/',
    },
  },
}
