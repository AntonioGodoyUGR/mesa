import type { GameDefinition } from '../types'

export const kanbanEv: GameDefinition = {
  slug: 'kanban-ev',
  name: 'Kanban EV',
  icon: '🚗',
  tagline: 'Colocación de trabajadores en una fábrica de coches con jefa exigente',
  theme: { primary: '#2f5a7a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de PV justo antes del recuento final (reuniones, coches y departamentos ya cuentan aquí)' },
    { key: 'shares', label: 'Acciones de la fábrica', short: 'Acciones', icon: '📈', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV finales por las acciones de la empresa que poseas y las mayorías de acciones' },
    { key: 'education', label: 'Educación y objetivos', short: 'Educación', icon: '🎓', type: 'number', points: 1, min: 0, hint: 'PV por tu nivel de educación (título académico) y por las metas cumplidas en cada departamento' },
    { key: 'cars', label: 'Coches y test-track', short: 'Coches', icon: '🏁', type: 'number', points: 1, min: 0, hint: 'PV por los coches que hayas terminado/quedado y por tus posiciones en las carreras del circuito de pruebas' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Colocad el tablero de la fábrica con sus 5 departamentos (Diseño, Personalización, Logística, Ensamblaje y Administración) y el circuito de pruebas.',
      'Cada jugador coge su trabajador, su hoja de coche/garaje, sus marcadores de departamento y su dinero inicial.',
      'Colocad a Sandra, la jefa, en su casilla de inicio, y preparad el ritmo de la partida (modo amable o exigente).',
      'Repartid las losetas de coche, las acciones de la empresa y los marcadores de educación en su posición de salida.',
    ],
    turn: [
      { name: '1. Mover a la jefa', detail: 'Al inicio de la ronda Sandra avanza por la fábrica; según dónde pare, premia a los diligentes y castiga a los que no ficharon (perder trabajador un turno).' },
      { name: '2. Colocar tu trabajador', detail: 'En tu turno mueves tu trabajador a un departamento y a una fila; llegar el primero a una fila da la acción fuerte, los de detrás la débil.' },
      { name: '3. Ejecutar la acción', detail: 'Según el departamento: coges piezas, personalizas coches, mejoras tu garaje, subes en educación, compras acciones o corres en el test-track.' },
      { name: '4. Reuniones y metas', detail: 'Al llenar filas se convocan reuniones que dan PV por las metas cumplidas; tras varias rondas Sandra da una vuelta completa y termina la partida.' },
    ],
    scoring: [
      { what: 'PV de reuniones y metas de departamento durante la partida', points: 'se acumulan en la vía' },
      { what: 'Acciones de la empresa y mayorías', points: 'PV finales según lo que poseas' },
      { what: 'Nivel de educación alcanzado', points: 'PV por tu título final' },
      { what: 'Coches terminados y posiciones en el circuito de pruebas', points: 'PV variables' },
      { what: 'No fichar cuando la jefa lo exige', points: 'penalización (perder acciones)' },
    ],
    endCondition:
      'La partida acaba cuando la jefa Sandra completa su recorrido por la fábrica (o al agotarse el ritmo). Se puntúan acciones, educación, coches y objetivos finales; gana quien tenga más PV.',
    reminders: [
      'Fichar a tiempo es vital: si Sandra te pilla sin trabajador colocado, pierdes tu siguiente turno. Nunca la ignores.',
      'Llegar primero a una fila de departamento da la acción potente; planifica el orden de colocación con eso en mente.',
      'La educación no da acción inmediata pero multiplica y desbloquea acciones fuertes: invierte pronto en ella.',
      'Las acciones de la empresa son una fuente de PV grande al final: cómpralas cuando el precio esté bajo.',
      'En modo «exigente» Sandra es mucho más dura; para las primeras partidas usad el modo amable.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/285984/kanban-ev',
    },
  },
}
