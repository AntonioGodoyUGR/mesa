import type { GameDefinition } from '../types'

export const tzolkin: GameDefinition = {
  slug: 'tzolkin',
  name: "Tzolk'in: The Mayan Calendar",
  icon: '🗓️',
  tagline: 'Engranajes mayas: cuanto más esperas, mejor es tu acción',
  theme: { primary: '#8a6a3a' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 90, max: 90 },
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
      min: -50,
      max: 200,
      showInSummary: true,
      hint: 'El total que sale de la hoja de puntuación final, tras convertir recursos',
    },
    {
      key: 'temples',
      label: 'Templos',
      icon: '🛕',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 60,
      hint: 'Suma de tu escalón en los tres templos, en las dos puntuaciones de fin de era',
    },
    {
      key: 'skulls',
      label: 'Calaveras de cristal',
      icon: '💀',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 10,
      hint: '3 PV cada una',
    },
    {
      key: 'corn',
      label: 'Maíz sobrante',
      icon: '🌽',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 60,
      hint: '1 PV por cada 4 de maíz, redondeando hacia abajo',
    },
    {
      key: 'monuments',
      label: 'Monumentos construidos',
      icon: '🗿',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 6,
      hint: 'Cada uno puntúa distinto: revisa su carta',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '90 min',
    setup: [
      'Monta el tablero con los engranajes y coloca el engranaje central (Tzolk\'in) con la flecha en un diente de Día de Comida.',
      'Prepara la reserva general de madera, piedra, oro, cristal y trabajadores, y las pilas de edificios y monumentos.',
      'Coloca a cada jugador su tablero individual, sus 3 trabajadores iniciales, 10 de maíz y un marcador en el escalón 0 de cada uno de los tres templos.',
      'Reparte 2 losetas de recurso inicial a cada jugador (elige 2 de las 4 que recibe) y deja el resto en la caja.',
      'Coloca los marcadores de tecnología en el nivel 0 de las cuatro ramas (Agricultura, Extracción de recursos, Arquitectura, Teología).',
    ],
    turn: [
      {
        name: '1. Colocar trabajadores',
        detail:
          'Paga en maíz el coste del hueco (el número del diente más el coste fijo de esa casilla) y coloca un trabajador nuevo en cualquier engranaje. Puedes colocar varios trabajadores en tu turno, uno detrás de otro.',
      },
      {
        name: '2. Recoger trabajadores y actuar',
        detail:
          'En lugar de colocar, retira UNO o TODOS los trabajadores que tengas en un mismo engranaje y ejecuta la acción de la casilla en la que ha llegado cada uno tras rotar. Colocar y recoger no se mezclan en el mismo turno.',
      },
      {
        name: '3. Pasar',
        detail:
          'Si no quieres o no puedes hacer nada más, pasa. Cuando todos han pasado, el engranaje Tzolk\'in gira un diente y empieza la siguiente ronda.',
      },
    ],
    scoring: [
      { what: 'Escalón en cada templo, en las dos puntuaciones de fin de era', points: 'igual al número del escalón (puede ser negativo en el fondo)' },
      { what: 'Escalón más alto de cada templo entre todos los jugadores', points: 'bonus según la posición (1º, 2º…)' },
      { what: 'Calavera de cristal', points: '3 por calavera' },
      { what: 'Recursos sobrantes al final, cambiados en el mercado y convertidos a maíz', points: '1 por cada 4 de maíz final (redondeo hacia abajo)' },
      { what: 'Monumentos construidos', points: 'variable, indicado en cada carta de monumento' },
      { what: 'Trabajadores sin alimentar en un Día de Comida', points: '−3 por trabajador' },
    ],
    endCondition:
      'La partida dura una vuelta completa del engranaje Tzolk\'in: termina en el cuarto Día de Comida. En el segundo y el cuarto Día de Comida se puntúan los templos en PV (y en el segundo, además, empieza la Era II, que cambia los edificios disponibles); en el primero y el tercero los templos solo dan recursos, sin puntos.',
    reminders: [
      'Alimentar cuesta 2 de maíz por cada trabajador que tengas en juego (los que están fuera del tablero no cuentan). Lo que no puedas pagar resta 3 PV por trabajador sin alimentar.',
      'El maíz para colocar un trabajador se paga en el momento de colocarlo, según el diente elegido: no se puede colocar sin poder pagarlo.',
      'Mendigar (cuando te quedan 2 de maíz o menos) te da 3 de maíz, pero baja tu marcador un escalón en un templo a tu elección.',
      'Solo puedes colocar trabajadores nuevos O recoger y actuar en tu turno, nunca las dos cosas a la vez.',
      'Las cuatro ramas de tecnología (nivel 1 a 3, más un bonus repetible de nivel 4) dan ventajas permanentes: revisarlas pronto suele compensar.',
    ],
    officialLink: {
      label: 'Tzolk\'in en la web de Czech Games Edition',
      url: 'https://czechgames.com/en/tzolkin/',
    },
  },
}
