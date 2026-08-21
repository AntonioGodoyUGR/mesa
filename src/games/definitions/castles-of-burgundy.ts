import type { GameDefinition } from '../types'

export const castlesOfBurgundy: GameDefinition = {
  slug: 'castles-of-burgundy',
  name: 'The Castles of Burgundy',
  icon: '🏰',
  tagline: 'Dados, losetas hexagonales y un ducado que encajar',
  theme: { primary: '#7a3a2e' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 30, max: 90 },
  difficulty: 'medium',
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
      min: -20,
      max: 300,
      showInSummary: true,
      hint: 'El total que marca tu ficha en la pista de puntos al final de la Fase E',
    },
    {
      key: 'regions',
      label: 'Regiones completadas',
      icon: '🗺️',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 8,
      hint: 'Cada región de tu tablero rellena por completo da puntos por tamaño y bonus de fase',
    },
    {
      key: 'buildings',
      label: 'Edificios construidos',
      icon: '🏛️',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 8,
      hint: 'Losetas beige activadas en tu región de edificios',
    },
    {
      key: 'leftovers',
      label: 'Monedas y trabajadores sobrantes',
      icon: '💰',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 40,
      hint: '1 PV por Silverling, 1 PV por cada 2 fichas de trabajador, 1 PV por mercancía sin vender',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '30–90 min según jugadores',
    setup: [
      'Cada jugador recibe un tablero de ducado (regiones de distinto color), un castillo inicial, 2 dados de su color y 3 losetas de mercancía al azar.',
      'El jugador inicial recibe 1 ficha de trabajador; el resto, 2, 3 y 4 en sentido horario, para compensar el turno.',
      'Se colocan en el tablero central las losetas hexagonales (164 en total) ordenadas por color en sus pilas, y se rellenan los 5 círculos numerados con losetas al azar.',
      'Se colocan las 12 losetas de bonus en sus casillas correspondientes y se preparan las losetas negras del depósito central.',
      'La partida se juega en 5 fases (A a E); cada fase tiene 5 rondas.',
    ],
    turn: [
      {
        name: '1. Tirada de dados',
        detail: 'Todos los jugadores tiran sus dos dados a la vez y los dejan visibles. El jugador inicial también tira el dado blanco para saber qué depósito recibe la nueva mercancía.',
      },
      {
        name: '2. Dos acciones, una por dado',
        detail: 'Por turnos, cada jugador usa el resultado de cada dado para: coger una loseta hexagonal del círculo con ese número, colocar una loseta de tu almacén en una casilla de tu tablero con ese número, vender mercancías, o coger 2 fichas de trabajador.',
      },
      {
        name: '3. Ajuste con trabajadores',
        detail: 'En cualquier momento puedes gastar una ficha de trabajador para subir o bajar en 1 el resultado de un dado (el 6 puede pasar a 1 y viceversa).',
      },
      {
        name: '4. Compra en el depósito negro',
        detail: 'Una vez por turno puedes pagar 2 Silverlings para comprar una loseta del depósito central negro, sin depender de los dados.',
      },
    ],
    scoring: [
      { what: 'Loseta de animal (verde claro)', points: 'PV iguales al número de animales de la loseta; si hay coincidencias en la misma región, se vuelven a puntuar todas' },
      { what: 'Vender mercancías (azul)', points: '1 Silverling + 2 a 4 PV por loseta, según número de jugadores' },
      { what: 'Completar una región del tablero', points: 'PV inmediatos según su tamaño (1 a 8 casillas) + bonus según la fase en curso (10 PV en fase A, hasta 2 PV en fase E)' },
      { what: '1º y 2º en completar cada color de región', points: 'Loseta grande (5–7 PV) para el primero, pequeña (2–4 PV) para el segundo' },
      { what: 'Minas (gris)', points: '1 Silverling por mina al final de cada fase (no dan PV directos)' },
      { what: 'Fin de partida', points: '1 PV por Silverling sobrante, 1 PV por cada 2 fichas de trabajador, 1 PV por mercancía sin vender' },
    ],
    endCondition:
      'La partida acaba al terminar la Fase E (la quinta). Gana quien más haya avanzado en la pista de puntos; en caso de empate, quien tenga menos casillas vacías en su tablero y, si persiste, quien juegue más tarde en el orden de turno.',
    reminders: [
      'Las losetas de edificio (beige) hacen efecto en cuanto se colocan: Almacén vende gratis, Banco da 2 Silverlings, Torre de vigilancia da 4 PV directos.',
      'Solo puedes tener un edificio de cada tipo por región de edificios (máximo 8 tipos).',
      'El castillo (verde oscuro) te deja repetir gratis, con el número que quieras, una de las otras tres acciones.',
      'Las losetas de barco (azul) mueven tu marcador en la pista de turno, además de darte mercancías.',
      'No se pueden colocar losetas fuera de las casillas del color correspondiente, y deben quedar conectadas a una loseta ya puesta.',
    ],
    officialLink: {
      label: 'Web oficial (Ravensburger / alea)',
      url: 'https://www.ravensburger.us/en-US/products/games/family-games/the-castles-of-burgundy-26925',
    },
  },
}
