import type { GameDefinition } from '../types'

export const twilightStruggle: GameDefinition = {
  slug: 'twilight-struggle',
  name: 'Twilight Struggle',
  icon: '☢️',
  tagline: 'EEUU contra la URSS: influencia, crisis y la sombra del DEFCON 1',
  theme: { primary: '#2c3e6b' },
  minPlayers: 2,
  maxPlayers: 2,
  playTime: { min: 120, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos de victoria al final de la partida',
      icon: '🎯',
      type: 'number',
      isTotal: true,
      min: -20,
      max: 20,
      showInSummary: true,
      hint: 'Positivo favorece a EEUU, negativo a la URSS; se anota tal cual marque el track de PV (de −20 a +20) al terminar',
    },
    {
      key: 'ended_by_score',
      label: '¿Terminó por marcador de puntos (turno 10)?',
      icon: '🏁',
      type: 'toggle',
      group: 'Desglose (opcional)',
    },
    {
      key: 'ended_by_defcon',
      label: '¿Terminó por DEFCON 1 (derrota automática)?',
      icon: '☢️',
      type: 'toggle',
      group: 'Desglose (opcional)',
    },
  ],

  rules: {
    players: '2 jugadores (EEUU contra URSS)',
    duration: '120–180 min',
    setup: [
      'Se coloca el marcador de PV en 0, el de DEFCON en el nivel 5 y el de Fase Espacial de cada jugador al inicio de su pista.',
      'Se reparte el control inicial de países según el mapa (EEUU controla Europa Occidental clave, URSS controla Europa del Este) con la influencia impresa.',
      'Se separan los mazos de cartas por Era (Guerra Temprana, Media y Tardía) y se baraja el mazo de la Guerra Temprana; cada jugador roba 8 cartas.',
      'La partida se juega en 10 turnos repartidos en las tres Eras, cada turno con varias rondas de cartas.',
    ],
    turn: [
      {
        name: 'Fase de cabecera',
        detail: 'Se resuelve el evento de "Encabezados": ambos jugadores escogen en secreto una carta y se revela primero la de mayor valor de operaciones (o el evento marcado como excepción).',
      },
      {
        name: 'Jugar una carta por ronda',
        detail: 'Alternando (empieza la URSS), cada jugador juega 1 carta de su mano para: (a) el evento impreso si es de tu bando o neutral, o (b) su valor numérico como Puntos de Operaciones para colocar/quitar influencia, realizar golpes de estado, Realineamiento o avanzar tu Fase Espacial.',
      },
      {
        name: 'Cartas del rival',
        detail: 'Si juegas por Operaciones una carta cuyo evento es del bando contrario, el evento se resuelve igualmente (salvo excepción marcada "solo por un lado") antes de usar los puntos.',
      },
      {
        name: 'Fin de turno',
        detail: 'Tras agotar la mano, se comprueban las cartas de Ganancia de Regiones (VP de control regional), se revisa el DEFCON (si baja a 2, hay restricciones de golpes de estado) y se reparte mano nueva.',
      },
    ],
    scoring: [
      { what: 'Controlar países con Batallas por Región (cartas especiales)', points: 'otorgan PV según el número de países controlados, países con base y control de la potencia dominante de esa región' },
      { what: 'Eventos de cartas con icono de PV', points: 'suman o restan directamente al marcador según el texto de la carta' },
      { what: 'Ganar la Carrera Espacial', points: 'da PV en hitos concretos de la pista espacial, además de ventajas de juego' },
    ],
    endCondition:
      'La partida acaba de una de tres formas: (1) el marcador de PV llega a −20 (victoria URSS) o +20 (victoria EEUU) en cualquier momento; (2) el DEFCON llega a 1 (derrota automática para quien lo causó); (3) se completan los 10 turnos, y entonces gana quien tenga más PV en ese momento (empate = victoria de la URSS por defecto del reglamento).',
    reminders: [
      'Bajar el DEFCON por debajo de 2 mediante Operaciones está prohibido: si una carta te obligaría a hacerlo, simplemente no puedes jugarla para eso.',
      'Los golpes de estado en Europa están restringidos si el DEFCON está en 2 (solo se permite en algunas circunstancias según la edición de reglas).',
      'Una carta jugada por su evento contrario igualmente gasta la carta de tu mano: revisa siempre si el evento es "obligatorio" incluso jugándola por Operaciones.',
      'La Carrera Espacial solo permite intentos limitados por turno (1 en la Guerra Temprana, más en fases posteriores) y consume la carta jugada sin dar Operaciones.',
      'Recuerda anotar el motivo del final de partida (marcador de puntos en el turno 10, o victoria automática por PV/DEFCON): cambia cómo se interpreta el resultado.',
    ],
    officialLink: {
      label: 'Web oficial (GMT Games)',
      url: 'https://www.gmtgames.com/p-927-twilight-struggle-deluxe-edition-8th-printing.aspx',
    },
  },
}
