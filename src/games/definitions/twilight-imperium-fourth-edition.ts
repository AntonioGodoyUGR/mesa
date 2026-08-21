import type { GameDefinition } from '../types'

export const twilightImperiumFourthEdition: GameDefinition = {
  slug: 'twilight-imperium',
  name: 'Twilight Imperium: Fourth Edition',
  icon: '🌌',
  tagline: 'La ópera espacial de ocho horas, negociada punto por punto',
  theme: { primary: '#6b5a1f' },
  minPlayers: 3,
  maxPlayers: 6,
  playTime: { min: 240, max: 480 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de Victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 10,

  fields: [
    {
      key: 'points',
      label: 'Puntos de Victoria totales',
      short: 'PV',
      icon: '🏆',
      type: 'number',
      isTotal: true,
      min: 0,
      max: 14,
      showInSummary: true,
      hint: 'Se gana al llegar a la meta acordada (normalmente 10, a veces 14 en partidas largas)',
    },
    {
      key: 'public_objectives',
      label: 'Objetivos públicos cumplidos',
      short: 'Públicos',
      icon: '📜',
      type: 'counter',
      min: 0,
      max: 10,
      hint: 'Informativo: los de Etapa I valen 1 PV y los de Etapa II valen 2 PV',
    },
    {
      key: 'secret_objectives',
      label: 'Objetivos secretos cumplidos',
      short: 'Secretos',
      icon: '🕵️',
      type: 'counter',
      min: 0,
      max: 3,
      hint: 'Informativo: cada jugador puede tener y cumplir hasta 3, 1 PV cada uno',
    },
    {
      key: 'support_for_throne',
      label: 'Fichas de Apoyo al Trono recibidas',
      short: 'Apoyos',
      icon: '👑',
      type: 'counter',
      min: 0,
      max: 6,
      hint: 'Informativo: otro jugador te las entrega en secreto, 1 PV cada una',
    },
  ],

  rules: {
    players: '3–6 jugadores (hasta 8 con expansión)',
    duration: '4–8 horas',
    setup: [
      'Cada jugador elige una facción (con su propia flota, tecnologías y habilidad especial) y coloca su sistema natal en un extremo de la galaxia.',
      'Se construye el tablero de galaxia colocando losetas hexagonales de sistema (al azar o con un mapa fijo) alrededor de Mecatol Rex, en el centro.',
      'Cada jugador recibe sus unidades iniciales, hoja de facción, cartas de tecnología iniciales y roba su mano de cartas de Objetivo Secreto.',
      'Se preparan los mazos de Objetivos Públicos (Etapa I y II), cartas de Acción, cartas Político/Agenda y las 8 cartas de Estrategia.',
    ],
    turn: [
      {
        name: '1. Fase de Estrategia',
        detail: 'Por orden de turno, cada jugador elige una carta de Estrategia distinta (Liderazgo, Diplomacia, Política, Construcción, Comercio, Guerra Tecnológica, Imperial, Guerrero...); la carta elegida marca el orden de turno de la ronda.',
      },
      {
        name: '2. Fase de Acción',
        detail: 'Por turnos, cada jugador hace una Acción Táctica (activar un sistema, mover flota, invadir o construir), una Acción Estratégica (jugar su carta de Estrategia) o una Acción de Componente, o pasa. La ronda sigue hasta que todos han pasado.',
      },
      {
        name: '3. Fase de Estado',
        detail: 'Se puntúan hasta 2 Objetivos Públicos y 1 Secreto por jugador, se revela un nuevo Objetivo Público si toca, se reparan/reenderezan unidades y cartas, se devuelven las cartas de Estrategia y se roban cartas de Acción.',
      },
      {
        name: '4. Fase de Agenda (si procede)',
        detail: 'Si algún jugador controla Mecatol Rex, se votan 1-2 cartas de Agenda (leyes permanentes o decisiones puntuales) usando los votos generados por los planetas controlados.',
      },
    ],
    scoring: [
      { what: 'Cumplir un Objetivo Público de Etapa I (visible para todos)', points: '1 PV' },
      { what: 'Cumplir un Objetivo Público de Etapa II (visible para todos)', points: '2 PV' },
      { what: 'Cumplir un Objetivo Secreto propio (máximo 3 por partida)', points: '1 PV cada uno' },
      { what: 'Recibir una ficha de Apoyo al Trono de otro jugador', points: '1 PV' },
      { what: 'Otras fuentes puntuales (carta Imperial, Reliquias, acuerdos políticos)', points: 'variable, según el efecto' },
    ],
    endCondition:
      'La partida termina en cuanto un jugador llega a la meta de Puntos de Victoria acordada (10 en partidas estándar, 14 en partidas largas) durante la Fase de Estado; si varios la alcanzan a la vez, gana quien tenga más PV y, en empate, el más cercano al inicio del orden de turno.',
    reminders: [
      'Los Objetivos Secretos no se enseñan nunca, ni siquiera al cumplirlos: solo se revela la carta boca abajo al mazo de puntuados.',
      'Solo puedes puntuar como máximo 1 Objetivo Público por tipo de fase de estado (2 en total) y 1 Secreto por ronda: no se acumulan puntuaciones atrasadas.',
      'Controlar Mecatol Rex da un planeta extra de recursos/influencia y habilita la Fase de Agenda, pero también te convierte en objetivo de todos.',
      'La negociación y los acuerdos verbales (no vinculantes) entre jugadores son parte central del juego, especialmente antes de las votaciones de Agenda.',
    ],
    officialLink: {
      label: 'Web oficial (Fantasy Flight Games)',
      url: 'https://www.fantasyflightgames.com/en/products/twilight-imperium-fourth-edition/',
    },
  },
}
