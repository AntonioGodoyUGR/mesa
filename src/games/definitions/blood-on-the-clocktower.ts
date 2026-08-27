import type { GameDefinition } from '../types'

export const bloodOnTheClocktower: GameDefinition = {
  slug: 'blood-on-the-clocktower',
  name: 'Blood on the Clocktower',
  icon: '🔔',
  tagline: 'Hombres lobo donde los muertos siguen jugando y el narrador miente',
  theme: { primary: '#7a1f2b' },
  minPlayers: 5,
  maxPlayers: 20,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Está en el bando ganador',
      short: 'Gana',
      icon: '🚩',
      type: 'toggle',
      points: 1,
      showInSummary: true,
    },
    {
      key: 'demon',
      label: 'Jugó al Demonio',
      short: 'Demonio',
      icon: '👹',
      type: 'toggle',
      min: 0,
    },
    {
      key: 'survived',
      label: 'Llegó vivo al final',
      short: 'Vivo',
      icon: '❤️',
      type: 'toggle',
      min: 0,
    },
  ],

  rules: {
    players: '5–20 jugadores (uno hace de Narrador y no cuenta como jugador)',
    duration: '60–120 min',
    setup: [
      'Una persona hace de Narrador: elige el guion (conjunto de personajes) apropiado al número de jugadores y no juega para ganar.',
      'Reparte en secreto un personaje a cada jugador según la distribución del guion: hay más Buenos (Habitantes y Ayuntamiento) que Malvados (Esbirros y el Demonio).',
      'Cada jugador mira su personaje en privado con el Narrador, sin enseñarlo a los demás.',
      'Coloca el reloj de las fases día/noche a la vista de todos.',
    ],
    turn: [
      { name: '1. Noche', detail: 'El Narrador despierta en privado a los personajes que actúan de noche, en el orden del guion, y aplica sus habilidades (matar, proteger, investigar...).' },
      { name: '2. Amanecer', detail: 'El Narrador anuncia quién ha muerto esa noche (o si nadie ha muerto) y el pueblo despierta.' },
      { name: '3. Día', detail: 'Todos debaten en voz alta, comparten información (verdadera o falsa) y acusan a quien crean Malvado.' },
      { name: '4. Nominación y votación', detail: 'Cualquier jugador vivo puede nominar a otro; se vota en público y quien reciba más votos que la mitad de los vivos es ejecutado.' },
    ],
    scoring: [
      { what: 'El bando Bueno gana', points: 'Si el Demonio muere ejecutado' },
      { what: 'El bando Malvado gana', points: 'Si solo quedan dos jugadores vivos, o se cumple la condición especial del guion' },
    ],
    endCondition:
      'La partida acaba en cuanto se cumple una condición de victoria: el Demonio es ejecutado (ganan los Buenos) o solo quedan dos vivos con el Demonio entre ellos (ganan los Malvados). Un jugador muerto sigue votando con su único voto fantasma restante y puede seguir hablando.',
    reminders: [
      'Los jugadores Malvados pueden mentir siempre; algunos Buenos reciben información falsa del Narrador sin saberlo (los "borrachos" o "locos" del guion).',
      'Un jugador muerto solo tiene un voto fantasma para el resto de la partida: úsalo con cuidado.',
      'El Narrador es la única fuente de verdad sobre las reglas y puede tener buena razón para no revelar cierta información: sus decisiones no se cuestionan en mesa.',
      'Elegid el guion según la experiencia del grupo: "Trouble Brewing" es el recomendado para empezar.',
    ],
    officialLink: {
      label: 'Web oficial (The Pandemonium Institute)',
      url: 'https://bloodontheclocktower.com/',
    },
  },
}
