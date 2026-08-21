import type { GameDefinition } from '../types'

export const warOfTheRing: GameDefinition = {
  slug: 'war-of-the-ring',
  name: 'War of the Ring: Second Edition',
  icon: '🌋',
  tagline: 'La Guerra del Anillo entera: ejércitos, dados y la Comunidad',
  theme: { primary: '#4a3f6b' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 150, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Victoria',
  scoreLabelShort: 'Vic.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Ha ganado (Pueblos Libres o Sauron)',
      short: 'Gana',
      icon: '👑',
      type: 'toggle',
      points: 1,
      uniquePerMatch: true,
      showInSummary: true,
      hint: 'Marca al bando ganador; con equipos de 4 marca a los jugadores de ese bando',
    },
  ],

  rules: {
    players: '2 jugadores (o 3–4 por equipos de 2 con la variante de bando compartido)',
    duration: '2.5–3 horas',
    setup: [
      'Un bando controla a Sauron (Mordor y sus aliados) y el otro a los Pueblos Libres (Elfos, Enanos, Rohan, Gondor...); cada bando despliega sus ejércitos iniciales sobre el mapa de la Tierra Media.',
      'La Comunidad del Anillo empieza junto a Frodo en Rivendel, con el marcador de Corrupción a 0 y boca abajo (su posición real es secreta para Sauron).',
      'Se preparan los mazos de cartas de Personaje y de Estrategia de cada bando, la Reserva de la Persecución (Hunt Pool) y el marcador de la Pista Política.',
      'Cada bando recibe sus dados de Acción (7 Sauron, 4 Pueblos Libres al inicio, variando según eventos) y sus fichas de Ejército, Personaje y Cerco.',
    ],
    turn: [
      {
        name: '1. Fase de la Comunidad',
        detail: 'El jugador de los Pueblos Libres decide si mueve la Comunidad (en secreto o a la vista) y cuántos dados de Acción se dedican a la Persecución de Sauron para intentar descubrirla o corromperla.',
      },
      {
        name: '2. Fase de Tirada de Acción',
        detail: 'Cada bando tira sus dados de Acción (símbolos de Personaje, Ejército, Musteración, Evento y el especial del Ojo/Vilya según el bando) que definen qué acciones podrá hacer esa ronda.',
      },
      {
        name: '3. Fase de Resolución de Acciones',
        detail: 'Los jugadores alternan turnos colocando un dado para mover ejércitos y librar batallas, mustrar tropas nuevas, activar personajes o jugar cartas de Evento, hasta agotar todos los dados.',
      },
      {
        name: '4. Comprobación de Victoria',
        detail: 'Al final de cada ronda se comprueba si algún bando ha cumplido su condición de victoria; si no, empieza una ronda nueva desde la Fase de la Comunidad.',
      },
    ],
    scoring: [
      { what: 'Sauron conquista suficientes bastiones de los Pueblos Libres en sus regiones de origen', points: 'victoria militar de Sauron' },
      { what: 'El marcador de Corrupción de la Comunidad llega a su máximo (el Anillo es reclamado por Sauron)', points: 'victoria de Sauron' },
      { what: 'El Portador del Anillo llega al Monte del Destino y el Anillo se destruye antes de que Sauron gane', points: 'victoria de los Pueblos Libres' },
      { what: 'Se agota el track de rondas sin que Sauron haya logrado ninguna de sus condiciones', points: 'victoria de los Pueblos Libres' },
    ],
    endCondition:
      'La partida termina en cuanto se cumple alguna condición de victoria: la conquista militar de Sauron sobre un número acordado de bastiones enemigos, la corrupción total de la Comunidad, la destrucción del Anillo en el Monte del Destino, o el agotamiento del track de rondas sin victoria militar de Sauron.',
    reminders: [
      'La posición de la Comunidad es secreta salvo que se mueva "a la vista" o sea descubierta por la Persecución: usad las fichas de despiste para no delatarla sin querer.',
      'Cuantos más dados de Acción dedique Sauron a perseguir la Comunidad, menos le quedan para la guerra abierta: es una decisión de cada ronda, no gratis.',
      'Los Sucesos Políticos de cada nación de los Pueblos Libres (Rohan, Gondor...) las activan para luchar abiertamente: hasta entonces están limitadas en lo que pueden hacer.',
      'Los Anillos Elfos y las cartas de Evento pueden alterar drásticamente la tirada de dados: guardadlas para el momento decisivo en vez de gastarlas pronto.',
    ],
    officialLink: {
      label: 'Web oficial (Ares Games)',
      url: 'https://aresgames.eu/games/war-of-the-ring/',
    },
  },
}
