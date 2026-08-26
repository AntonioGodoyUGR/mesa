import type { GameDefinition } from '../types'

export const arkhamHorrorLcg: GameDefinition = {
  slug: 'arkham-horror-lcg',
  name: 'Arkham Horror: The Card Game',
  icon: '🕯️',
  tagline: 'Campaña de cartas: tu investigador arrastra sus traumas y su experiencia',
  theme: { primary: '#4a3b6b' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'survived', label: '¿Superasteis el escenario?', short: 'Superado', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, la resolución del escenario es de equipo' },
    { key: 'xp', label: 'Experiencia ganada', short: 'XP', icon: '✨', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: puntos de experiencia para mejorar tu mazo entre escenarios' },
    { key: 'physical_trauma', label: 'Trauma físico', short: 'T. físico', icon: '🩹', type: 'counter', min: 0, hint: 'Informativo: cada trauma físico baja tu aguante máximo en la campaña' },
    { key: 'mental_trauma', label: 'Trauma mental', short: 'T. mental', icon: '🧠', type: 'counter', min: 0, hint: 'Informativo: cada trauma mental baja tu cordura máxima en la campaña' },
  ],

  rules: {
    players: '1–4 investigadores (2 con un solo núcleo)',
    duration: '60–120 min por escenario',
    setup: [
      'Cada jugador elige un investigador y monta (o coge prehecho) su mazo de 30 cartas respetando las clases y el límite de nivel.',
      'Prepara el escenario según la guía de campaña: localizaciones, mazo de planes (perdición), mazo de actos (progreso) y mazo de encuentros.',
      'Llena la bolsa del caos con las fichas de la dificultad elegida (Fácil, Normal, Difícil o Experto).',
      'Cada investigador coge sus recursos iniciales (5), roba mano de 5 cartas con opción de mulligan y coloca su carta de mini-investigador en la localización de inicio.',
      'Ten a mano el registro de campaña para anotar resoluciones, XP y traumas.',
    ],
    turn: [
      { name: '1. Fase de mitos', detail: 'Añade 1 de perdición al plan actual; luego cada investigador roba y resuelve 1 carta de encuentro (monstruos, tesoros de la locura, sucesos).' },
      { name: '2. Fase de investigación', detail: 'Por turnos, cada investigador realiza 3 acciones: mover, investigar (conseguir pistas), atacar, evadir, jugar cartas, robar, ganar recurso o activar.' },
      { name: '3. Fase de enemigos', detail: 'Los enemigos se enfrentan a los investigadores y atacan haciendo daño y horror.' },
      { name: '4. Mantenimiento', detail: 'Reinicia acciones, cada investigador roba 1 carta y gana 1 recurso, y se refresca lo agotado.' },
    ],
    scoring: [
      { what: 'Alcanzar el acto final o la resolución de victoria', points: 'superáis el escenario' },
      { what: 'Cada pista gastada en avanzar un acto', points: 'progreso hacia la victoria' },
      { what: 'Que avance el último plan (demasiada perdición)', points: 'suele significar derrota' },
      { what: 'Que un investigador quede eliminado (daño o horror)', points: 'sufre trauma y sale del escenario' },
      { what: 'Registrar XP y traumas', points: 'condicionan los próximos escenarios de la campaña' },
    ],
    endCondition:
      'El escenario termina al llegar a una resolución (por victoria, por derrota o por una condición concreta de la guía). Se anota en el registro de campaña la resolución, la experiencia ganada y los traumas sufridos; la campaña sigue con el siguiente escenario.',
    reminders: [
      'Es una campaña: la experiencia mejora tu mazo y los traumas te acompañan escenario tras escenario.',
      'La bolsa del caos sustituye a los dados: sacas una ficha y sumas su modificador a tu prueba de habilidad.',
      'Cada carta de encuentro que no resuelvas bien acelera la perdición del plan: no te distraigas de los actos.',
      'Un investigador derrotado por daño gana trauma físico; por horror, trauma mental. Dos traumas del mismo tipo pueden matarlo definitivamente.',
      'No hay victoria «perfecta»: a veces la mejor resolución es huir viva para pelear otro día.',
    ],
    officialLink: {
      label: 'Web oficial (Fantasy Flight Games)',
      url: 'https://www.fantasyflightgames.com/en/products/arkham-horror-the-card-game/',
    },
  },
}
