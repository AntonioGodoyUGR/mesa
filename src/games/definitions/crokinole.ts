import type { GameDefinition } from '../types'

export const crokinole: GameDefinition = {
  slug: 'crokinole',
  name: 'Crokinole',
  icon: '🎯',
  tagline: 'Lanza fichas de un capirotazo al agujero central',
  theme: { primary: '#6b4423' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 20, max: 40 },
  difficulty: 'easy',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos totales',
      icon: '🎯',
      type: 'number',
      isTotal: true,
      min: 0,
      max: 200,
      showInSummary: true,
      hint: 'Acumulado de todas las rondas hasta llegar a los puntos pactados (habitual: 50 o 100)',
    },
    {
      key: 'center_hits',
      label: 'Fichas en el agujero central',
      icon: '🕳️',
      type: 'counter',
      group: 'Desglose (opcional)',
      min: 0,
      max: 20,
      hint: '20 puntos cada una',
    },
  ],

  rules: {
    players: '2 jugadores, o 4 por parejas enfrentadas',
    duration: '20–40 min',
    setup: [
      'Cada jugador (o pareja) elige un color de fichas y se sienta en su cuadrante del tablero.',
      'Con 2 jugadores, cada uno tiene 12 fichas; con 4 (2 parejas sentadas en cuadrantes opuestos), cada jugador tiene 6.',
      'El tablero circular tiene, de fuera adentro, tres anillos de puntuación (5, 10 y 15 puntos) y el agujero central, que vale 20.',
    ],
    turn: [
      {
        name: '1. Lanzar por turnos',
        detail: 'Empezando por un jugador y alternando, cada uno lanza sus fichas de una en una desde su línea de tiro, dándoles un capirotazo con el dedo.',
      },
      {
        name: '2. Golpear si hay fichas rivales',
        detail: 'Si hay fichas del rival en el tablero, tu tiro tiene que tocar o mover alguna: si no lo hace, tu ficha se retira del tablero sin puntuar (va "a la zanja").',
      },
      {
        name: '3. Repetir hasta gastar todas las fichas',
        detail: 'Se sigue alternando turno hasta que todos los jugadores han lanzado todas sus fichas.',
      },
      {
        name: '4. Puntuar la ronda',
        detail: 'Se cuentan las fichas que quedan en cada anillo (o en el agujero) y se suman los puntos de esa ronda para cada jugador o pareja.',
      },
    ],
    scoring: [
      { what: 'Ficha en el agujero central', points: '20 puntos' },
      { what: 'Ficha en el anillo interior', points: '15 puntos' },
      { what: 'Ficha en el anillo medio', points: '10 puntos' },
      { what: 'Ficha en el anillo exterior', points: '5 puntos' },
      { what: 'Ficha que toca la línea entre dos anillos', points: 'cuenta el valor del anillo menor' },
    ],
    endCondition:
      'Se juegan rondas seguidas sumando los puntos de cada una hasta que alguien llega a la meta pactada de antemano (habitual: 50 o 100 puntos). Gana quien primero la alcanza o quien tenga más puntos al terminar la última ronda acordada.',
    reminders: [
      'Si empujas una ficha rival hasta meterla en el agujero central, esos 20 puntos son para el rival, no para ti.',
      'Con jugadores nuevos es habitual relajar la obligación de golpear ficha rival, dejando repetir el tiro para que la partida sea más amable.',
      'En las reglas de torneo de la National Crokinole Association las partidas se juegan a rondas de 2 puntos por ronda ganada (1 si hay empate) en vez de sumar la diferencia de puntos: es una variante más formal que la casera descrita aquí.',
    ],
    officialLink: {
      label: 'Reglas de torneo (World Crokinole Championship)',
      url: 'https://www.worldcrokinole.com/thegame.html',
    },
  },
}
