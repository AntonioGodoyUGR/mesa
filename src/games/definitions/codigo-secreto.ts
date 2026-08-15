import type { GameDefinition } from '../types'

// Código Secreto (Codenames) es por equipos, no por jugador: en la mesa gana un bando
// entero. Para encajarlo en el modelo por jugador de la app, cada uno anota los «agentes»
// que su equipo llegó a contactar (el bando ganador contacta a TODOS los suyos, así que
// se lleva la puntuación más alta) y marca si fue jefe de espías o si tocó al asesino.
// El asesino resta a saco: destaparlo es perder en el acto, cae al último puesto.
export const codigoSecreto: GameDefinition = {
  slug: 'codenames',
  name: 'Código Secreto',
  icon: '🕵️',
  tagline: 'Una palabra, un número y una cara de espanto en tu equipo',
  theme: { primary: '#c1272d' },
  minPlayers: 2,
  maxPlayers: 8,
  playTime: { min: 15, max: 15 },
  difficulty: 'easy',
  scoreLabel: 'Agentes',
  scoreLabelShort: 'Ag.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'agents_contacted',
      label: 'Agentes contactados',
      short: 'Agentes',
      icon: '🎯',
      type: 'counter',
      points: 1,
      min: 0,
      max: 9,
      showInSummary: true,
      hint: 'Cartas de tu color que tu equipo destapó. Gana quien contacta a todos: 9 el equipo que empieza, 8 el otro',
    },
    {
      key: 'spymaster',
      label: 'Jefe de espías',
      short: 'Jefe',
      icon: '🧠',
      type: 'toggle',
      group: 'Registro',
      showInSummary: true,
      hint: 'Diste las pistas de tu equipo, viendo la clave 5×5',
    },
    {
      key: 'assassin',
      label: 'Tocó al asesino',
      short: 'Asesino',
      icon: '💀',
      type: 'toggle',
      points: -99,
      group: 'Registro',
      hint: 'Tu equipo destapó al asesino y perdió la partida en el acto',
    },
  ],

  rules: {
    players: '2–8+ jugadores (ideal 4+, en dos equipos parejos: rojo y azul)',
    duration: '15 min',
    setup: [
      'Formad dos equipos, rojo y azul, lo más parejos posible.',
      'Colocad 25 cartas-palabra boca arriba en una rejilla de 5×5.',
      'Cada equipo elige a su jefe de espías; los dos jefes se sientan al mismo lado de la mesa.',
      'Coged una carta-clave 5×5 al azar y ponedla en el atril, visible SOLO para los dos jefes: marca 9 agentes del equipo que empieza, 8 del otro, los transeúntes inocentes y el único asesino.',
      'El equipo que empieza (el del color que la clave señale con 9 agentes) juega primero.',
    ],
    turn: [
      {
        name: '1. El jefe da la pista',
        detail:
          'El jefe de espías dice UNA sola palabra y UN número: la palabra relaciona varias cartas de su color; el número dice cuántas.',
      },
      {
        name: '2. El equipo toca cartas',
        detail:
          'Los agentes hablan y tocan una carta. Si es de su color, aciertan y pueden seguir tocando (hasta el número dicho +1). Si dudan, pueden plantarse.',
      },
      {
        name: '3. Fin del turno',
        detail:
          'El turno acaba al plantarse, al agotar los intentos o al fallar: tocar un transeúnte o un agente rival pasa el turno al otro equipo. Tocar al asesino pierde la partida al instante.',
      },
    ],
    scoring: [
      { what: 'Contactar a todos tus agentes', points: 'Tu equipo gana' },
      { what: 'Agentes del equipo que empieza', points: '9' },
      { what: 'Agentes del otro equipo', points: '8' },
      { what: 'Tocar al asesino', points: 'Derrota inmediata' },
      { what: 'Tocar a un rival', points: 'Le adelantas un agente y pierdes el turno' },
    ],
    endCondition:
      'Gana el primer equipo que contacta a todos sus agentes. La partida también acaba en seco si un equipo destapa al asesino: ese equipo pierde y gana el contrario.',
    reminders: [
      'La pista es siempre UNA palabra y un número; nada de dos palabras, guiones ni gestos.',
      'La pista no puede ser ninguna de las palabras visibles en la rejilla (ni un trozo de ellas).',
      'Con el número puedes tocar una carta más de las anunciadas: útil para pescar aciertos de pistas anteriores.',
      'Los jefes no dan pistas ni caras: se aguantan mientras su equipo se equivoca.',
      'Si alguien toca al asesino, se acabó: no importa cuántos agentes llevara cada bando.',
    ],
    officialLink: {
      label: 'Web oficial (Czech Games Edition)',
      url: 'https://czechgames.com/en/codenames/',
    },
  },
}
