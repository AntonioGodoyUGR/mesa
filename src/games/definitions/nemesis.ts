import type { GameDefinition } from '../types'

export const nemesis: GameDefinition = {
  slug: 'nemesis',
  name: 'Nemesis',
  icon: '👽',
  tagline: 'Una nave infestada, objetivos secretos y nadie de quien fiarse',
  theme: { primary: '#3a3f44' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 90, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'won', label: 'Sobrevivió y cumplió objetivo', short: 'Gana', icon: '🚀', type: 'toggle', points: 1, showInSummary: true, hint: 'Marca a cada jugador que termine vivo Y con al menos uno de sus objetivos cumplido' },
    { key: 'objectives', label: 'Objetivos cumplidos', short: 'Objetivos', icon: '🎯', type: 'counter', min: 0, max: 2, hint: 'Informativo: cada personaje tiene objetivos secretos; a veces enfrentados con los demás' },
    { key: 'survived', label: 'Terminó con vida', short: 'Vivo', icon: '❤️', type: 'toggle', hint: 'Informativo: sobrevivir no basta para ganar si no cumpliste ningún objetivo' },
  ],

  rules: {
    players: '1–5 jugadores (semicooperativo)',
    duration: '90–180 min',
    setup: [
      'Montad la nave con las losetas de sala boca abajo alrededor del núcleo, con los pasillos y las salidas hacia las cápsulas de escape.',
      'Cada jugador elige un personaje con su tablero, su mazo de acción personal y sus objetos iniciales.',
      'Reparte a cada uno 2 cartas de objetivo (quedaos con una en secreto) y su carta de corporación si jugáis con ellas.',
      'Preparad la bolsa de intrusos con las fichas iniciales, el mazo de encuentro, los eventos y las fichas de fuego/ruido/malfunción.',
      'Colocad el ovíparo, los nidos y el marcador de tiempo/rondas según el escenario.',
    ],
    turn: [
      { name: '1. Acciones del jugador', detail: 'En tu turno tienes 2 acciones: moverte, buscar objetos, disparar, cuerpo a cuerpo, manipular la sala (reparar, cerrar puertas) o descansar. Muchas se pagan jugando cartas de tu mano de acción.' },
      { name: '2. Ruido y encuentros', detail: 'Moverte o actuar genera ruido: tira el dado de ruido en las salas adyacentes; si coincide con un intruso, aparece y hay encuentro (robas una carta de encuentro).' },
      { name: '3. Fase de eventos e intrusos', detail: 'Al pasar todos, se resuelve la carta de evento: los intrusos se mueven, atacan, ponen huevos y el nivel de infestación de la nave puede subir.' },
    ],
    scoring: [
      { what: 'Terminar vivo y con un objetivo cumplido', points: 'ese jugador gana la partida' },
      { what: 'Sobrevivir sin cumplir ningún objetivo', points: 'no se gana: escapar no basta' },
      { what: 'Morir en la nave o en una cápsula que no llega', points: 'derrota individual' },
    ],
    endCondition:
      'La partida acaba cuando la nave llega a la Tierra o estalla, o cuando todos los personajes han muerto o escapado. Cada superviviente comprueba en privado sus objetivos: gana quien esté vivo y haya cumplido al menos uno.',
    reminders: [
      'Es semicooperativo: los objetivos pueden estar enfrentados (llevar un huevo a la Tierra vs. destruir la nave), así que colaborar y traicionar forman parte del juego.',
      'El ruido es tu peor enemigo: cada acción arriesga atraer un intruso a tu sala.',
      'Las cápsulas de escape y el hipersueño tienen plazas limitadas: quien se queda atrás cuando la nave revienta, pierde.',
      'Los personajes heridos acumulan cartas de herida en su mazo; demasiadas te dejan sin acciones útiles.',
      'Antes de escapar comprueba si tu objetivo exige un estado concreto de la nave (destruida, salvada, con muestra): a veces impedir que otro gane es tu misión.',
    ],
    officialLink: {
      label: 'Web oficial (Awaken Realms)',
      url: 'https://awakenrealms.com/games/nemesis/',
    },
  },
}
