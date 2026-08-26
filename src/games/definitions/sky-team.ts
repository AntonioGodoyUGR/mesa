import type { GameDefinition } from '../types'

export const skyTeam: GameDefinition = {
  slug: 'sky-team',
  name: 'Sky Team',
  icon: '✈️',
  tagline: 'Piloto y copiloto aterrizan un avión colocando dados en silencio',
  theme: { primary: '#2f6f8a' },
  minPlayers: 2,
  maxPlayers: 2,
  playTime: { min: 15, max: 20 },
  difficulty: 'medium',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'landed', label: '¿Aterrizaje conseguido?', short: 'Aterrizó', icon: '🛬', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo los dos: es cooperativo, aterrizáis o os estrelláis en equipo' },
    { key: 'airport', label: 'Aeropuerto / escenario', short: 'Aeropuerto', icon: '🗺️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: nivel o aeropuerto jugado (dificultad creciente en la campaña)' },
    { key: 'rounds_left', label: 'Rondas de aproximación restantes', short: 'Rondas', icon: '⏱️', type: 'number', min: 0, hint: 'Informativo: cuántas rondas os quedaban al aterrizar (0 = apurado al máximo)' },
  ],

  rules: {
    players: '2 jugadores (exactamente): piloto y copiloto',
    duration: '15–20 min',
    setup: [
      'Colocad el tablero central entre los dos: el piloto se sienta a la izquierda (azul) y el copiloto a la derecha (naranja).',
      'Cada jugador coge sus 4 dados y su pantalla para ocultarlos. Poned el avión al inicio de la senda de aproximación.',
      'Situad el marcador de inclinación (eje) centrado, la altitud en su casilla inicial y las fichas de aviones/tráfico según el escenario.',
      'Elegid aeropuerto o módulo de dificultad: la caja propone una campaña con aeropuertos cada vez más exigentes.',
    ],
    turn: [
      { name: '1. Tirar en secreto', detail: 'Ambos tiráis vuestros 4 dados tras la pantalla, sin enseñarlos ni hablar de sus valores.' },
      { name: '2. Colocar alternando', detail: 'Empezando por el piloto, alternáis colocando un dado cada vez en las casillas de acción, en silencio absoluto: eje, motores, radio, tren de aterrizaje, flaps, frenos, radar...' },
      { name: '3. Resolver la ronda', detail: 'Se aplican los efectos: el eje inclina el avión, los motores lo hacen avanzar por la senda, la radio despeja aviones, y se comprueban los límites.' },
      { name: '4. Bajar la altitud', detail: 'Se desciende un paso en la aproximación y comienza la siguiente ronda hasta llegar a la pista.' },
    ],
    scoring: [
      { what: 'Aterrizar con tren desplegado, flaps, velocidad y frenos correctos', points: 'victoria en equipo' },
      { what: 'Inclinar el avión más allá del límite del eje', points: 'derrota inmediata' },
      { what: 'Chocar con un avión no despejado por la radio', points: 'derrota inmediata' },
      { what: 'Llegar al suelo sin frenar o con exceso de velocidad', points: 'derrota inmediata' },
    ],
    endCondition:
      'La partida acaba al completar la última ronda de aproximación: si el avión toca pista con todo en orden (eje equilibrado, tren y flaps puestos, velocidad y frenos correctos), ganáis; cualquier fallo grave por el camino provoca la derrota inmediata.',
    reminders: [
      'Silencio total durante la colocación: no podéis comunicar los valores de vuestros dados salvo lo que el módulo permita.',
      'Colocáis alternando y siempre empieza el piloto: el orden importa tanto como el valor.',
      'Cada casilla es de un solo rol: hay acciones que solo puede hacer el piloto y otras solo el copiloto.',
      'Las fichas de concentración/café dan re-tiradas o ajustes: guardadlas para las rondas críticas.',
      'El tren de aterrizaje y los frenos necesitan varias rondas: no lo dejéis todo para el final.',
    ],
    officialLink: {
      label: 'Web oficial (Le Scorpion Masqué)',
      url: 'https://scorpionmasque.com/en/sky-team',
    },
  },
}
