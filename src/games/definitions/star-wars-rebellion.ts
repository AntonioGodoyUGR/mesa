import type { GameDefinition } from '../types'

export const starWarsRebellion: GameDefinition = {
  slug: 'star-wars-rebellion',
  name: 'Star Wars: Rebellion',
  icon: '⭐',
  tagline: 'El Imperio busca la base rebelde; la Rebelión solo tiene que aguantar',
  theme: { primary: '#7a2f3d' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 180, max: 240 },
  difficulty: 'hard',
  scoreLabel: 'Victoria',
  scoreLabelShort: 'Vic.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Ha ganado (Imperio o Rebelión)',
      short: 'Gana',
      icon: '👑',
      type: 'toggle',
      points: 1,
      uniquePerMatch: true,
      showInSummary: true,
      hint: 'Marca al bando ganador; con 4 jugadores marca a los dos del bando',
    },
  ],

  rules: {
    players: '2–4 jugadores (2 bandos, hasta 2 por bando)',
    duration: '3–4 horas',
    setup: [
      'Un bando juega al Imperio (con la Estrella de la Muerte y una flota enorme) y el otro a la Rebelión, que empieza con una base secreta oculta entre varios sistemas candidatos.',
      'Se coloca el mapa de la galaxia con sus sistemas, se reparten las flotas y tropas iniciales de cada bando según el escenario, y se preparan los mazos de misión de cada bando.',
      'Cada bando prepara su reserva de Líderes (personajes con habilidades únicas: Vader, Leia, Tarkin, Luke...) disponibles para asignar a misiones.',
      'Se coloca el marcador en la casilla inicial del Track de Rondas, que marca cuánto tiempo tiene el Imperio para encontrar la base rebelde.',
    ],
    turn: [
      {
        name: '1. Fase de Refresco',
        detail: 'Ambos bandos recuperan a sus Líderes usados, roban nuevas cartas de Objetivo/Misión y las colocan boca abajo listas para asignar.',
      },
      {
        name: '2. Fase de Misión',
        detail: 'Por turnos alternos, cada bando asigna Líderes a sistemas para ejecutar misiones en secreto (reclutar sistemas, construir, sabotear, buscar la base rebelde, propaganda...), que se van revelando y resolviendo.',
      },
      {
        name: '3. Fase de Combate',
        detail: 'Donde haya flotas o tropas de ambos bandos en el mismo sistema, se resuelve combate espacial y/o terrestre con dados de combate según las unidades presentes.',
      },
      {
        name: '4. Fase de Objetivos',
        detail: 'Se revelan las cartas de Objetivo jugadas boca abajo al principio de la ronda, aplicando sus efectos (mover el track de rondas, ganar reputación, dar bonificaciones puntuales).',
      },
    ],
    scoring: [
      { what: 'El Imperio localiza la base rebelde y destruye todas las fuerzas terrestres que la defienden (o la Estrella de la Muerte la reduce a escombros)', points: 'victoria del Imperio' },
      { what: 'El track de rondas llega a su final sin que el Imperio haya destruido la base rebelde', points: 'victoria de la Rebelión' },
    ],
    endCondition:
      'La partida termina en cuanto el Imperio encuentra y destruye la base rebelde (victoria imperial) o el track de rondas se agota sin que eso ocurra (victoria rebelde). La velocidad del track depende de la reputación que cada bando gane con los sistemas neutrales.',
    reminders: [
      'La ubicación real de la base rebelde es secreta desde el principio: solo se descubre investigando sistemas candidatos con misiones o forzando su localización por combate.',
      'Cada Líder solo puede hacer una cosa por ronda: morir o ser capturado en una misión fallida los deja fuera de la partida hasta que se rescaten o se den por perdidos.',
      'Ganar la lealtad de sistemas neutrales (reputación) es tan importante como el combate: acelera o frena el track de rondas según quién la tenga.',
      'El Imperio empieza con más fuerza militar bruta, pero cada ronda que pasa favorece a la Rebelión: la presión del tiempo es la tensión central del juego.',
    ],
    officialLink: {
      label: 'Web oficial (Fantasy Flight Games)',
      url: 'https://www.fantasyflightgames.com/en/products/star-wars-rebellion/',
    },
  },
}
