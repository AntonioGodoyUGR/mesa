import type { GameDefinition } from '../types'

export const tooManyBones: GameDefinition = {
  slug: 'too-many-bones',
  name: 'Too Many Bones',
  icon: '🦴',
  tagline: 'Dados-personaje que suben de nivel escaramuza tras escaramuza',
  theme: { primary: '#6b5a2f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'tyrant_defeated', label: '¿Derrotasteis al tirano?', short: 'Tirano', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, ganáis o perdéis en equipo contra el jefe final' },
    { key: 'gearloc_level', label: 'Nivel del Gearloc', short: 'Nivel', icon: '⬆️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: cuántos dados de habilidad desbloqueaste (subes de nivel gastando puntos de progreso)' },
    { key: 'days', label: 'Días recorridos', short: 'Días', icon: '📅', type: 'number', min: 0, hint: 'Informativo: días avanzados en la vía antes del enfrentamiento con el tirano' },
    { key: 'hp_left', label: 'Vida restante al final', short: 'Vida', icon: '❤️', type: 'number', min: 0, hint: 'Informativo: puntos de vida que le quedaban a tu Gearloc' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador elige un Gearloc con su tapete de personaje, su reserva de dados de habilidad y sus fichas de vida.',
      'Elegid el Tirano (jefe final) y la dificultad; preparad su tapete, sus esbirros de refuerzo y la vía de Días.',
      'Barajad el mazo de encuentros y colocad el marcador de progreso al inicio de la vía.',
      'Cada Gearloc empieza con sus dados iniciales y su vida a tope; la matriz de batalla solo se monta cuando salta un combate.',
    ],
    turn: [
      { name: '1. Nuevo día', detail: 'Robáis una carta de encuentro: puede ser una decisión narrativa, un evento o un combate contra esbirros.' },
      { name: '2. Combate por iniciativa', detail: 'Si hay batalla, colocáis a los personajes y esbirros en la matriz; por orden de iniciativa cada uno tira su reserva de dados.' },
      { name: '3. Gastar dados', detail: 'Asignáis los dados a vuestras habilidades de ataque, defensa y movimiento sobre la matriz para derrotar a los esbirros.' },
      { name: '4. Progreso y mejora', detail: 'Al ganar el combate subís progreso; con puntos de progreso desbloqueáis nuevos dados de habilidad, recuperáis vida y conseguís botín.' },
    ],
    scoring: [
      { what: 'Derrotar al Tirano final', points: 'victoria del equipo' },
      { what: 'Que caigan todos los Gearlocs en combate', points: 'derrota' },
      { what: 'Que el Tirano complete su progreso antes de tiempo', points: 'derrota' },
      { what: 'Subir de nivel y coger botín', points: 'os hace más fuertes para el jefe, no dan puntos' },
    ],
    endCondition:
      'Tras avanzar los días marcados por la dificultad aparece el Tirano. Si lo derrotáis en la batalla final, ganáis; si vuestros Gearlocs caen o el Tirano cumple su condición de victoria, perdéis. No hay puntuación numérica: se gana o se pierde en equipo.',
    reminders: [
      'Es puro cooperativo táctico: coordinad posiciones en la matriz, porque un Gearloc solo cae rápido.',
      'Subir de nivel entre combates es clave: llegar al Tirano con pocos dados de habilidad es casi una derrota segura.',
      'Cada Gearloc juega distinto (a distancia, cuerpo a cuerpo, invocando, controlando): repartid roles al elegir.',
      'La dificultad y el Tirano elegidos cambian por completo el reto: empezad por un Tirano suave si es vuestra primera partida.',
      'Guardad recursos de curación para la batalla final: llegar al Tirano a plena vida marca la diferencia.',
    ],
    officialLink: {
      label: 'Web oficial (Chip Theory Games)',
      url: 'https://chiptheorygames.com/too-many-bones/',
    },
  },
}
