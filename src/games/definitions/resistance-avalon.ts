import type { GameDefinition } from '../types'

export const resistanceAvalon: GameDefinition = {
  slug: 'resistance-avalon',
  name: 'The Resistance: Avalon',
  icon: '🗡️',
  tagline: 'La Resistencia con Merlín, Percival y Mordred',
  theme: { primary: '#5a4a8a' },
  minPlayers: 5,
  maxPlayers: 10,
  playTime: { min: 30, max: 30 },
  difficulty: 'medium',
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
  ],

  rules: {
    players: '5–10 jugadores (mejor de 6 en adelante)',
    duration: '30 min',
    setup: [
      'Según el número de jugadores, reparte los roles: los leales (Resistencia) siempre son mayoría.',
      'Con los personajes especiales, incluye siempre a Merlín (leal, ve a los malvados) y Percival (leal) contra Mordred (malvado, invisible para Merlín) y el Asesino (malvado).',
      'Reparte una carta de personaje boca abajo a cada jugador; mírala en secreto y sin enseñarla.',
      'Los malvados se reconocen entre sí (menos Mordred, que Merlín no ve); Merlín ve a todos los malvados excepto a Mordred.',
      'Coloca el marcador de misión en la primera de las cinco misiones y el marcador de rechazos en 0.',
    ],
    turn: [
      {
        name: '1. Proponer equipo',
        detail:
          'El líder de la ronda propone en voz alta quién va en el equipo para la misión actual, según el número de jugadores que le toque.',
      },
      {
        name: '2. Votar la propuesta',
        detail:
          'Todos votan en secreto y a la vez (a favor o en contra) si aprueban ese equipo. Si gana el «a favor», el equipo sale a la misión; si no, el turno de líder pasa al siguiente jugador y sube el contador de rechazos.',
      },
      {
        name: '3. Ejecutar la misión',
        detail:
          'Cada miembro del equipo elige en secreto una carta de Éxito o de Fallo. Se mezclan y se revelan: un solo Fallo (dos en algunas misiones con 7+ jugadores) hace fracasar la misión.',
      },
      {
        name: '4. Asesinato final (si la Resistencia gana 3 misiones)',
        detail:
          'Si los leales completan 3 misiones con éxito, los malvados tienen una última oportunidad: el Asesino intenta adivinar quién es Merlín. Si acierta, ganan los malvados igualmente.',
      },
    ],
    scoring: [
      { what: 'La Resistencia (leales) completa 3 misiones', points: 'ganan los leales, salvo que el Asesino acierte quién es Merlín' },
      { what: 'Los malvados hacen fracasar 3 misiones', points: 'ganan los malvados' },
      { what: 'Se rechazan 5 propuestas de equipo seguidas', points: 'ganan los malvados directamente' },
    ],
    endCondition:
      'La partida acaba en cuanto un bando llega a 3 misiones (a favor o en contra), o si se rechazan 5 equipos seguidos en una misma misión. Con la Resistencia en 3 misiones, aún puede perder si el Asesino identifica a Merlín.',
    reminders: [
      'Los malvados se conocen entre sí (menos Mordred); los leales normales no saben nada, solo Merlín y Percival tienen información.',
      'Un miembro leal del equipo SIEMPRE debe votar Éxito en la misión: solo un malvado puede votar Fallo.',
      'Percival ve a «Merlín y Morgana» pero no sabe cuál es cuál si juega Morgana: es información ambigua a propósito.',
      'Hablar y razonar en voz alta durante la votación es la mitad del juego: no hay turnos de silencio.',
      'Si Mordred está en la partida, Merlín NO lo ve como malvado: es el único punto ciego de su información.',
    ],
    officialLink: {
      label: 'The Resistance: Avalon en la web de Indie Boards & Cards',
      url: 'https://indieboardsandcards.com/index.php/our-games/the-resistance/avalon/',
    },
  },
}
