import type { GameDefinition } from '../types'

export const lordOfTheRingsDuelForMiddleEarth: GameDefinition = {
  slug: 'lotr-duel-for-middle-earth',
  name: 'The Lord of the Rings: Duel for Middle-earth',
  icon: '💍',
  tagline: 'Duelo a dos bandos: la Comunidad contra Sauron, sin puntos, solo victoria',
  theme: { primary: '#5a3f8a' },
  minPlayers: 2,
  maxPlayers: 2,
  playTime: { min: 45, max: 60 },
  difficulty: 'medium',
  scoreLabel: 'Victoria',
  scoreLabelShort: 'Vic.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Ha ganado (Comunidad o Sauron)',
      short: 'Gana',
      icon: '👑',
      type: 'toggle',
      points: 1,
      uniquePerMatch: true,
      showInSummary: true,
      hint: 'Marca al bando ganador de la partida',
    },
  ],

  rules: {
    players: '2 jugadores',
    duration: '45–60 min',
    setup: [
      'Un jugador controla la Comunidad del Anillo (hobbits, elfos, enanos, hombres) y el otro a Sauron (Nazgûl y sirvientes); cada uno prepara su mazo de cartas Azules (acciones) y Verdes (razas/objetivos).',
      'Se monta el tablero de Regiones de la Tierra Media y se colocan Fortalezas y Unidades iniciales de cada bando en sus regiones de partida.',
      'Frodo y Sam empiezan en la Comarca, al inicio de la pista del Anillo.',
      'Se preparan los mazos de robo y se reparte la mano inicial de cada jugador.',
    ],
    turn: [
      {
        name: '1. Fase de la Comunidad',
        detail: 'El jugador de la Comunidad decide si avanza a Frodo y Sam por la pista hacia el Monte del Destino.',
      },
      {
        name: '2. Acciones con cartas Azules',
        detail: 'Cada jugador juega cartas Azules para mover Unidades, atacar Fortalezas o reforzar regiones.',
      },
      {
        name: '3. Acciones con cartas Verdes',
        detail: 'Cada jugador juega cartas Verdes para sumar símbolos de Raza (Rally) o activar efectos especiales de personajes.',
      },
      {
        name: '4. Comprobación de victoria',
        detail: 'Tras cada capítulo se comprueba si algún bando ha cumplido alguna condición de victoria inmediata.',
      },
    ],
    scoring: [
      { what: 'Frodo y Sam llegan al Monte del Destino y destruyen el Anillo', points: 'victoria inmediata de la Comunidad' },
      { what: 'Los Nazgûl capturan a Frodo y Sam antes de llegar', points: 'victoria inmediata de Sauron' },
      { what: 'Un bando reúne 6 símbolos de Raza distintos en sus cartas Verdes', points: 'victoria inmediata de ese bando (Rally)' },
      { what: 'Un bando conquista las 7 regiones de la Tierra Media', points: 'victoria inmediata de ese bando (Dominación)' },
      { what: 'Ninguna condición cumplida al final del Capítulo 3', points: 'gana quien controle más regiones (Fortaleza y/o Unidad)' },
    ],
    endCondition:
      'La partida termina en cuanto se cumple alguna de las tres condiciones de victoria inmediata (Anillo destruido o capturado, 6 símbolos de Raza, o las 7 regiones dominadas). Si nadie lo consigue al acabar el Capítulo 3, gana quien esté presente en más regiones.',
    reminders: [
      'No hay puntos de victoria: es un duelo temático de todo o nada, así que solo se anota quién ganó.',
      'La Comunidad puede intentar las tres vías a la vez; vigilad qué símbolos de Raza va acumulando el rival, no solo su avance en la pista del Anillo.',
      'Conquistar una región requiere eliminar la Fortaleza y las Unidades del rival en ella, no basta con tener más tropas de paso.',
      'El Rally (6 símbolos de Raza) puede llegar de repente: no descuidéis las cartas Verdes por perseguir solo la vía militar.',
    ],
    officialLink: {
      label: 'Web oficial (Repos Production)',
      url: 'https://www.rprod.com/en/games/duel-for-middle-earth',
    },
  },
}
