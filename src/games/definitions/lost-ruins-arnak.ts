import type { GameDefinition } from '../types'

export const lostRuinsArnak: GameDefinition = {
  slug: 'lost-ruins-arnak',
  name: 'Lost Ruins of Arnak',
  icon: '🗿',
  tagline: 'Expedición arqueológica: mazo, trabajadores y dos vías de investigación',
  theme: { primary: '#2f6b4f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 30, max: 120 },
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
      min: -10,
      max: 150,
      showInSummary: true,
      hint: 'Suma todas las categorías de la hoja de puntuación final tras la Ronda V',
    },
    {
      key: 'guardians',
      label: 'Guardianes superados',
      icon: '👹',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 6,
      hint: '5 PV cada uno',
    },
    {
      key: 'idols',
      label: 'Ídolos colocados',
      icon: '🗿',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 6,
      hint: '3 PV cada uno, más el valor de los huecos vacíos que hayan quedado',
    },
    {
      key: 'fear',
      label: 'Cartas y losetas de miedo',
      icon: '😱',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 15,
      hint: '−1 PV por carta de miedo, −2 PV por loseta de miedo',
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '30–120 min según jugadores',
    setup: [
      'Cada jugador recibe un tablero personal con 2 figuras de arqueólogo, un mazo inicial de 2 cartas de Financiación, 2 de Exploración y 2 de Miedo.',
      'Según el orden de turno, cada jugador recibe recursos iniciales distintos (de 2 monedas al primero a 1 moneda + 2 brújulas al cuarto) para compensar la ventaja de jugar antes.',
      'Se preparan las dos vías de investigación (lupa y libreta), el mercado de cartas y el tablero de mapa con el campamento inicial.',
      'La partida dura 5 rondas fijas.',
    ],
    turn: [
      {
        name: '1. Robar mano',
        detail: 'Al empezar cada ronda, todos roban hasta tener 5 cartas en mano.',
      },
      {
        name: '2. Una acción principal',
        detail: 'Por turnos, cada jugador hace UNA acción principal: excavar en un yacimiento, descubrir un yacimiento nuevo, superar un guardián, comprar una carta, jugar una carta, o investigar en una de las dos vías. También puede pasar.',
      },
      {
        name: '3. Acciones gratis',
        detail: 'Antes o después de la acción principal se pueden hacer todas las acciones marcadas con el rayo: jugar efectos de cartas, colocar ídolos, usar bonificaciones de guardián o activar ayudantes.',
      },
      {
        name: '4. Fin de ronda',
        detail: 'Cuando todos han pasado: se retiran los arqueólogos al tablero (ganando una carta de Miedo por cada uno que vuelva de un yacimiento con guardián), se baraja la zona de juego al fondo del mazo, se refrescan los ayudantes y se rellena la fila de cartas del mercado.',
      },
    ],
    scoring: [
      { what: 'Posición en la vía de la lupa', points: 'según la fila alcanzada; llegar antes al Templo Perdido da más puntos' },
      { what: 'Posición en la vía de la libreta', points: 'según la fila alcanzada' },
      { what: 'Losetas de Templo compradas', points: 'el valor indicado en cada loseta' },
      { what: 'Ídolos colocados', points: '3 PV cada uno, más el valor de cada hueco de tu tablero que se haya quedado vacío' },
      { what: 'Guardianes superados', points: '5 PV cada uno' },
      { what: 'Cartas de objeto y artefacto', points: 'el valor impreso en cada carta' },
      { what: 'Cartas y losetas de Miedo', points: '−1 PV por carta, −2 PV por loseta' },
    ],
    endCondition:
      'La partida acaba tras completar la Ronda V (se salta la preparación de esa ronda y se pasa directo a la puntuación final). Gana quien más puntos totales tenga; en empate, quien llegara antes al Templo Perdido y, si sigue el empate, quien tenga mejor puntuación de investigación.',
    reminders: [
      'La libreta nunca puede adelantar a la lupa en la misma vía de investigación.',
      'Cada fila de investigación da su efecto SIEMPRE al pasar por ella, tenga o no loseta de bonus disponible.',
      'Subir un ayudante de plata a oro también lo refresca ese mismo turno.',
      'Las cartas de objeto compradas van al fondo del mazo, no a la mano: se ven la ronda siguiente.',
      'El avión (pagando 2 monedas) cubre cualquier icono de viaje; coche y barco no se cubren entre sí, pero cualquiera cubre a la bota.',
    ],
    officialLink: {
      label: 'Web oficial (Czech Games Edition)',
      url: 'https://czechgames.com/en/lost-ruins-of-arnak/',
    },
  },
}
