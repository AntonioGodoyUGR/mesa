/**
 * Cómo se convierte una ficha de BoardGameGeek en un juego de Table Tracker.
 *
 * Está aparte de `ingest-bgg.ts` porque es lo único de la ingesta que se puede
 * comprobar sin red: decenas de miles de filas se escriben con estas reglas y nadie las
 * va a mirar una a una, así que se testean aquí (`bgg-games.test.ts`).
 *
 * La frontera: aquí NO se decide nada de puntuación ni de color. Eso lo decide
 * `expandCatalogSeedRow`, en `src/games/catalog.ts`, que es la misma puerta que usa la
 * semilla del repo. Lo de aquí es solo traducir el vocabulario de BGG —categorías,
 * mecánicas, peso— al puñado de datos que esa puerta entiende.
 */
import { expandCatalogSeedRow, type SheetId } from '../../src/games/catalog'
import type { BggThing } from './bgg-api'
import type { BggFacts, SeedGame } from './game-rows'
import type { GameDefinition, GameDifficulty } from '../../src/games/types'

/**
 * Las categorías de BGG, en español y con su icono.
 *
 * La interfaz está en español y las categorías de BGG no. Están **las 84** que BGG usa,
 * con su nombre exacto: son una lista cerrada que se mueve muy de tarde en tarde, y con
 * la lista entera no se cuela ni un lema a medio traducir en la tarjeta de nadie. Si BGG
 * añadiera una, se queda en su idioma, que es mejor que quedarse sin lema.
 *
 * El icono sale de la primera categoría que tenga uno: es el emoji que se pinta cuando
 * un juego no tiene carátula. Las categorías sin icono son las que no tienen ninguno que
 * las diga de verdad —una guerra concreta, un siglo—, y ahí vale más pasar a la
 * siguiente que poner un emoji cualquiera.
 */
const CATEGORIES: Record<string, { es: string; icon?: string }> = {
  'Abstract Strategy': { es: 'Abstracto', icon: '⬛' },
  'Action / Dexterity': { es: 'Habilidad', icon: '🎯' },
  Adventure: { es: 'Aventura', icon: '🗺️' },
  'Age of Reason': { es: 'Edad Moderna' },
  'American Civil War': { es: 'Guerra de Secesión' },
  'American Indian Wars': { es: 'Guerras indias' },
  'American Revolutionary War': { es: 'Independencia de EE. UU.' },
  'American West': { es: 'Oeste americano', icon: '🤠' },
  Ancient: { es: 'Antigüedad', icon: '🏛️' },
  Animals: { es: 'Animales', icon: '🐾' },
  Arabian: { es: 'Mundo árabe' },
  'Aviation / Flight': { es: 'Aviación', icon: '✈️' },
  Bluffing: { es: 'Faroleo', icon: '🎭' },
  Book: { es: 'Literatura', icon: '📖' },
  'Card Game': { es: 'Cartas', icon: '🃏' },
  "Children's Game": { es: 'Infantil', icon: '🧸' },
  'City Building': { es: 'Construir ciudades', icon: '🏙️' },
  'Civil War': { es: 'Guerra civil' },
  Civilization: { es: 'Civilizaciones', icon: '🏛️' },
  'Collectible Components': { es: 'Coleccionable' },
  'Comic Book / Strip': { es: 'Cómic', icon: '💥' },
  Deduction: { es: 'Deducción', icon: '🔍' },
  Dice: { es: 'Dados', icon: '🎲' },
  Economic: { es: 'Económico', icon: '💰' },
  Educational: { es: 'Educativo', icon: '📚' },
  Electronic: { es: 'Electrónico', icon: '🔌' },
  Environmental: { es: 'Naturaleza', icon: '🌿' },
  'Expansion for Base-game': { es: 'Expansión' },
  Exploration: { es: 'Exploración', icon: '🧭' },
  'Fan Expansion': { es: 'Expansión de aficionados' },
  Fantasy: { es: 'Fantasía', icon: '🐉' },
  Farming: { es: 'Agricultura', icon: '🌾' },
  Fighting: { es: 'Combate', icon: '🥊' },
  'Game System': { es: 'Sistema de juego' },
  Horror: { es: 'Terror', icon: '👻' },
  Humor: { es: 'Humor', icon: '😄' },
  'Industry / Manufacturing': { es: 'Industria', icon: '🏭' },
  'Korean War': { es: 'Guerra de Corea' },
  Mafia: { es: 'Mafia', icon: '🕵️' },
  Math: { es: 'Matemáticas', icon: '🔢' },
  'Mature / Adult': { es: 'Adultos' },
  Maze: { es: 'Laberintos', icon: '🌀' },
  Medical: { es: 'Medicina', icon: '🩺' },
  Medieval: { es: 'Medieval', icon: '🏰' },
  Memory: { es: 'Memoria', icon: '🧠' },
  Miniatures: { es: 'Miniaturas', icon: '🗿' },
  'Modern Warfare': { es: 'Guerra moderna' },
  'Movies / TV / Radio theme': { es: 'Cine y televisión', icon: '🎬' },
  'Murder/Mystery': { es: 'Misterio', icon: '🔎' },
  Music: { es: 'Música', icon: '🎵' },
  Mythology: { es: 'Mitología', icon: '⚡' },
  Napoleonic: { es: 'Napoleónico' },
  Nautical: { es: 'Náutico', icon: '⛵' },
  Negotiation: { es: 'Negociación', icon: '🤝' },
  'Novel-based': { es: 'Literatura', icon: '📖' },
  Number: { es: 'Números', icon: '🔢' },
  'Party Game': { es: 'Fiesta', icon: '🎉' },
  'Pike and Shot': { es: 'Pica y arcabuz' },
  Pirates: { es: 'Piratas', icon: '🦜' },
  Political: { es: 'Política', icon: '🗳️' },
  'Post-Napoleonic': { es: 'Siglo XIX' },
  Prehistoric: { es: 'Prehistoria', icon: '🦕' },
  'Print & Play': { es: 'Imprime y juega', icon: '🖨️' },
  Puzzle: { es: 'Rompecabezas', icon: '🧩' },
  Racing: { es: 'Carreras', icon: '🏁' },
  'Real-time': { es: 'Tiempo real', icon: '⏱️' },
  Religious: { es: 'Religión' },
  Renaissance: { es: 'Renacimiento' },
  'Science Fiction': { es: 'Ciencia ficción', icon: '🚀' },
  'Space Exploration': { es: 'Espacio', icon: '🪐' },
  'Spies/Secret Agents': { es: 'Espionaje', icon: '🕶️' },
  Sports: { es: 'Deportes', icon: '🏅' },
  'Territory Building': { es: 'Territorios', icon: '🗺️' },
  Trains: { es: 'Trenes', icon: '🚂' },
  Transportation: { es: 'Transporte', icon: '🚚' },
  Travel: { es: 'Viajes', icon: '🧳' },
  Trivia: { es: 'Preguntas', icon: '❓' },
  'Video Game Theme': { es: 'Videojuegos', icon: '🕹️' },
  'Vietnam War': { es: 'Guerra de Vietnam' },
  Wargame: { es: 'Bélico', icon: '⚔️' },
  'Word Game': { es: 'Palabras', icon: '🔤' },
  'World War I': { es: 'Primera Guerra Mundial', icon: '⚔️' },
  'World War II': { es: 'Segunda Guerra Mundial', icon: '⚔️' },
  Zombies: { es: 'Zombis', icon: '🧟' },
}

/** Sin categoría reconocible, el dado: es el icono de «juego de mesa» de la app. */
const DEFAULT_ICON = '🎲'

/**
 * El lema sale de las categorías de BGG, nunca de su descripción.
 *
 * La descripción es texto con autor y licencia; las categorías son etiquetas de un
 * puñado de palabras. Tres bastan para que la tarjeta diga algo («Cartas · Fantasía ·
 * Combate») sin copiar nada de nadie.
 */
export function taglineOf(categories: string[]): string {
  const labels = categories.slice(0, 3).map((name) => CATEGORIES[name]?.es ?? name)
  return labels.join(' · ') || 'Juego de mesa'
}

export function iconOf(categories: string[]): string {
  for (const name of categories) {
    const icon = CATEGORIES[name]?.icon
    if (icon) return icon
  }
  return DEFAULT_ICON
}

/**
 * El peso que vota la gente en BGG va de 1 a 5. Los cortes en 2 y 3 son los que usa la
 * propia comunidad para hablar de «filler», «medio» y «pesado».
 */
export function difficultyOf(weight: number | undefined): GameDifficulty | undefined {
  if (!weight) return undefined
  if (weight < 2) return 'easy'
  if (weight < 3) return 'medium'
  return 'hard'
}

/**
 * Qué se apunta al acabar la partida.
 *
 * Solo se distinguen los dos casos en los que apuntar puntos sería sencillamente
 * incorrecto: el cooperativo, donde se gana o se pierde en equipo, y el de bandos. El
 * resto cae en `points`, que es lo que hace la mayoría de la gente con una libreta.
 */
export function sheetOf(mechanics: string[]): SheetId {
  if (mechanics.includes('Cooperative Game')) return 'coop'
  if (mechanics.includes('Team-Based Game')) return 'teams'
  return 'points'
}

/** «Ticket to Ride: Europe» → «ticket-to-ride-europe». */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 60)
    .replace(/-+$/, '')

  // `games_custom_slug_prefix` reserva el prefijo `c-` para los juegos que se inventa un
  // grupo: la restricción exige que un juego de catálogo NO empiece por ahí. Le pasa a
  // cualquier título que empiece por una «C» suelta («C&C: Ancients»).
  return slug.startsWith('c-') ? `bgg-${slug}` : slug
}

/** Un slug libre: primero el título, luego con el año y por último con el ID de BGG. */
export function freeSlug(thing: BggThing, taken: ReadonlySet<string>): string | null {
  const base = slugify(thing.name ?? '')
  if (!base) return null

  const tries = [base, thing.year ? `${base}-${thing.year}` : '', `${base}-${thing.id}`]
  for (const candidate of tries) {
    if (candidate && !taken.has(candidate)) return candidate
  }
  return null
}

/** Lo que BGG aporta de un juego, valga o no la pena su ficha. */
export function factsOf(thing: BggThing): BggFacts {
  return {
    id: thing.id,
    year: thing.year,
    popularity: thing.votes ?? 0,
    coverUrl: thing.image,
    coverThumbUrl: thing.thumbnail,
  }
}

/**
 * La ficha de BGG, convertida en un juego del catálogo.
 *
 * Pasa por `expandCatalogSeedRow` a propósito, que es la misma puerta que usa la
 * semilla: qué hoja de puntuación y qué color le tocan a un juego lo decide el motor;
 * aquí solo se rellena la fila que el motor entiende.
 */
export function definitionOf(thing: BggThing, slug: string): GameDefinition {
  const categories = thing.categories ?? []
  const minPlayers = Math.max(1, thing.minPlayers ?? 2)
  const maxPlayers = Math.max(minPlayers, thing.maxPlayers ?? minPlayers)
  const minTime = thing.minTime ?? 0
  const maxTime = Math.max(minTime, thing.maxTime ?? 0)

  const game = expandCatalogSeedRow([
    slug,
    thing.name ?? slug,
    iconOf(categories),
    taglineOf(categories),
    minPlayers,
    maxPlayers,
    minTime,
    maxTime,
    'medium',
    sheetOf(thing.mechanics ?? []),
  ])

  return {
    ...game,
    // Lo que BGG no sabe se deja sin poner en vez de inventarse un valor por defecto:
    // una duración de «0 a 0 minutos» saldría en los filtros y sería mentira.
    difficulty: difficultyOf(thing.weight),
    playTime: maxTime > 0 ? { min: minTime, max: maxTime } : undefined,
  }
}

/**
 * La ficha entera, lista para que `gameRow` la convierta en fila.
 *
 * Devuelve `null` para lo que no debe entrar en el catálogo: las expansiones —la
 * partida es del juego base, no de su caja de ampliación—, las fichas sin nombre y las
 * que no consiguen un slug libre.
 */
export function bggSeedGame(thing: BggThing, taken: ReadonlySet<string>): SeedGame | null {
  if (thing.type !== 'boardgame' || !thing.name) return null

  const slug = freeSlug(thing, taken)
  if (!slug) return null

  return {
    game: definitionOf(thing, slug),
    sheetId: sheetOf(thing.mechanics ?? []),
    bgg: factsOf(thing),
  }
}
