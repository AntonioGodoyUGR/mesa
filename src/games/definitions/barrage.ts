import type { GameDefinition } from '../types'

export const barrage: GameDefinition = {
  slug: 'barrage',
  name: 'Barrage',
  icon: '💧',
  tagline: 'Presas, conductos y turbinas para producir energía en los Alpes',
  theme: { primary: '#2f6b7a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de PV justo antes del recuento final (contratos y energía producida ya cuentan aquí)' },
    { key: 'external_works', label: 'Obras externas', short: 'Obras', icon: '🏗️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV impresos en las losetas de obra externa (bonos permanentes) que hayas construido' },
    { key: 'wheel', label: 'Rueda de máquinas', short: 'Rueda', icon: '⚙️', type: 'number', points: 1, min: 0, hint: 'PV finales por las piezas que te queden en la rueda de construcción / no gastadas según la variante' },
    { key: 'majorities', label: 'Mayorías y objetivos', short: 'Mayorías', icon: '🏅', type: 'number', points: 1, min: 0, hint: 'PV por mayorías de energía en las rondas y por la loseta de objetivo final' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '90–120 min',
    setup: [
      'Cada jugador elige una compañía (con su poder especial) y recibe su tablero personal, su rueda de construcción con las piezas iniciales y sus ingenieros.',
      'Montad el tablero central: el río con sus cuencas y conductos, la vía de PV, el mercado de energía y las 5 losetas de contrato de la primera ronda.',
      'Colocad las losetas de obra externa disponibles, los objetivos de ronda y las gotas de agua en las fuentes de cabecera.',
      'Repartid el dinero y las máquinas iniciales; cada compañía coloca sus discos en la vía de PV en 0.',
    ],
    turn: [
      { name: '1. Elegir contratos', detail: 'Al inicio de la ronda cada jugador toma en secreto una loseta de contrato que le pagará al producir esa cantidad de energía.' },
      { name: '2. Colocar ingenieros', detail: 'Por turnos, colocáis ingenieros (y pagáis con máquinas de la rueda) en las acciones: construir presa/conducto/central, producir energía, coger obras externas o tomar dinero.' },
      { name: '3. Producir energía', detail: 'Al producir, hacéis bajar el agua por vuestros conductos hasta una central; la energía generada cumple contratos, da dinero y PV, y sube en la mayoría de la ronda.' },
      { name: '4. Fin de ronda', detail: 'Se puntúan las mayorías de energía y el objetivo de ronda, las máquinas gastadas vuelven a la rueda tras varios turnos, y el agua fluye río abajo.' },
    ],
    scoring: [
      { what: 'Cumplir contratos de energía', points: 'los PV y el dinero impresos en el contrato' },
      { what: 'Mayorías de energía producida por ronda', points: 'PV según el ranking de esa ronda' },
      { what: 'Losetas de obra externa construidas', points: 'sus PV finales' },
      { what: 'Loseta de objetivo final y objetivos de ronda', points: 'PV según lo logrado' },
    ],
    endCondition:
      'La partida dura 5 rondas. Tras la última se puntúan la mayoría final, el objetivo final y las obras externas; gana quien tenga más PV en la vía.',
    reminders: [
      'Las máquinas viajan por tu rueda de construcción y tardan turnos en volver: si las gastas todas te quedas sin poder construir. Gestiona el ciclo.',
      'El agua es compartida: producir vacía las cuencas de arriba y beneficia a quien tenga presas río abajo. Vigila dónde construyen los rivales.',
      'Construir cuesta máquinas Y ocupa un espacio concreto del río; planifica presas, conductos y centrales como un sistema conectado.',
      'Elige el contrato según la energía que vayas a producir esa ronda: cumplir de más no da extra, cumplir de menos no cobra.',
      'Las obras externas dan poderes fuertes y PV: pelea por las que encajen con tu estrategia antes de que se agoten.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/251247/barrage',
    },
  },
}
