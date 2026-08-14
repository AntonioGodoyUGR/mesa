/**
 * Índice de los volcados de BoardGameGeek que haya en `scripts/data/`.
 *
 * De dónde salen los CSV (los dos son gratuitos, piden cuenta y no se versionan):
 *   - `boardgamegeek.com/data_dumps/bg_ranks` — el volcado oficial de rankings.
 *   - Kaggle, `bwandowando/boardgamegeek-board-games-reviews-jan-2025` — ~162 000
 *     juegos, expansiones incluidas, y con columna de imagen.
 *
 * Se aceptan los dos formatos —y cualquier otro parecido— porque las columnas se
 * detectan por nombre en vez de darlas por hechas. Con esto se resuelve el mapa
 * `slug → id de BGG` sin llamar a ninguna API, que es lo que permite avanzar sin
 * esperar a que aprueben el token.
 */
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickColumn, readCsv } from './csv'
import { baseName, normalise, slugToTitle, type GameEntry } from './games'

const here = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = resolve(here, '..', 'data')

export interface DumpEntry {
  id: number
  name: string
  /** Posición en el ranking general. 0 = sin clasificar. */
  rank: number
  votes: number
  /** URL de la carátula, si el volcado la trae. */
  image?: string
}

export interface DumpMatch {
  entry: DumpEntry
  /** Cómo se ha encontrado, de más a menos fiable. */
  how: 'exact' | 'base' | 'tokens'
}

/** Un token tan repetido que no sirve para acotar candidatos («the», «game», «of»). */
const COMMON_TOKEN_LIMIT = 4000

function tokensOf(name: string): string[] {
  return normalise(name).split(' ').filter(Boolean)
}

/** Mejor de dos filas: primero el ranking, luego los votos, luego el ID más bajo. */
function better(a: DumpEntry, b: DumpEntry): DumpEntry {
  const rankA = a.rank > 0 ? a.rank : Number.MAX_SAFE_INTEGER
  const rankB = b.rank > 0 ? b.rank : Number.MAX_SAFE_INTEGER
  if (rankA !== rankB) return rankA < rankB ? a : b
  if (a.votes !== b.votes) return a.votes > b.votes ? a : b
  return a.id <= b.id ? a : b
}

function similarity(a: string[], b: string[]): number {
  const left = new Set(a)
  const right = new Set(b)
  let shared = 0
  for (const token of left) if (right.has(token)) shared += 1
  return shared / (left.size + right.size - shared)
}

export class BggDump {
  private readonly byId = new Map<number, DumpEntry>()
  private readonly byExact = new Map<string, DumpEntry>()
  private readonly byBase = new Map<string, DumpEntry>()
  private readonly byToken = new Map<string, number[]>()

  get size(): number {
    return this.byId.size
  }

  get hasImages(): boolean {
    for (const entry of this.byId.values()) if (entry.image) return true
    return false
  }

  add(entry: DumpEntry): void {
    const previous = this.byId.get(entry.id)
    if (previous) {
      // La misma ficha en dos volcados: se completa lo que le falte a la primera.
      if (!previous.image && entry.image) previous.image = entry.image
      if (previous.rank === 0 && entry.rank > 0) previous.rank = entry.rank
      if (entry.votes > previous.votes) previous.votes = entry.votes
      return
    }
    this.byId.set(entry.id, entry)

    const exact = normalise(entry.name)
    if (!exact) return
    const current = this.byExact.get(exact)
    this.byExact.set(exact, current ? better(current, entry) : entry)

    const base = baseName(entry.name)
    if (base && base !== exact) {
      const currentBase = this.byBase.get(base)
      this.byBase.set(base, currentBase ? better(currentBase, entry) : entry)
    }

    for (const token of new Set(tokensOf(entry.name))) {
      const postings = this.byToken.get(token)
      if (postings) postings.push(entry.id)
      else this.byToken.set(token, [entry.id])
    }
  }

  byBggId(id: number): DumpEntry | undefined {
    return this.byId.get(id)
  }

  /** Las filas que comparten algún token poco común con el nombre dado. */
  private neighbours(name: string): DumpEntry[] {
    const ids = new Set<number>()
    for (const token of new Set(tokensOf(name))) {
      const postings = this.byToken.get(token)
      if (!postings || postings.length > COMMON_TOKEN_LIMIT) continue
      for (const id of postings) ids.add(id)
    }
    return [...ids].map((id) => this.byId.get(id)!).filter(Boolean)
  }

  /**
   * Los mejores candidatos por parecido de tokens, de más a menos.
   * Sirve tanto para resolver como para escribir el bloque PENDIENTE.
   */
  candidates(entry: GameEntry, limit: number): { entry: DumpEntry; score: number }[] {
    const wanted = tokensOf(entry.name)
    if (wanted.length === 0) return []
    return this.neighbours(entry.name)
      .map((candidate) => ({ entry: candidate, score: similarity(wanted, tokensOf(candidate.name)) }))
      .sort((a, b) => b.score - a.score || (a.entry.rank || Infinity) - (b.entry.rank || Infinity))
      .slice(0, limit)
  }

  /**
   * Busca el juego en el volcado. Por orden: nombre exacto, nombre exacto derivado del
   * slug, nombre sin subtítulo y —solo si gana con claridad— parecido de tokens.
   */
  find(game: GameEntry): DumpMatch | null {
    const exact = this.byExact.get(normalise(game.name))
    if (exact) return { entry: exact, how: 'exact' }

    // El nombre en la app está a veces en español («Catán», «Aventureros al tren»);
    // el slug suele venir del título original, así que es un segundo intento gratis.
    const fromSlug = this.byExact.get(normalise(slugToTitle(game.slug)))
    if (fromSlug) return { entry: fromSlug, how: 'exact' }

    const base = this.byBase.get(normalise(game.name))
    if (base) return { entry: base, how: 'base' }

    const [best, second] = this.candidates(game, 2)
    // Umbral alto y ventaja clara sobre el segundo: si dos cajas de la misma familia
    // puntúan parecido, no hay forma de saber cuál es y vale más dejarlo pendiente.
    if (best && best.score >= 0.8 && (!second || best.score - second.score >= 0.2)) {
      return { entry: best.entry, how: 'tokens' }
    }
    return null
  }
}

/** Carga todos los CSV de `scripts/data/`. Devuelve un índice vacío si no hay ninguno. */
export async function loadDumps(): Promise<BggDump> {
  const dump = new BggDump()
  if (!existsSync(DATA_DIR)) return dump

  const files = readdirSync(DATA_DIR).filter((file) => file.toLowerCase().endsWith('.csv'))
  for (const file of files) {
    let columns: { id?: string; name?: string; rank?: string; votes?: string; image?: string } = {}
    let first = true

    const rows = await readCsv(join(DATA_DIR, file), (row) => {
      if (first) {
        first = false
        const header = Object.keys(row)
        columns = {
          id: pickColumn(header, ['id', 'bggid', 'objectid', 'game_id', 'gameid']),
          name: pickColumn(header, ['name', 'primary', 'game_name', 'title']),
          rank: pickColumn(header, ['rank', 'boardgame_rank', 'game_rank', 'rank_boardgame']),
          votes: pickColumn(header, ['usersrated', 'users_rated', 'numuserratings', 'numratings']),
          image: pickColumn(header, ['image', 'imagepath', 'image_url', 'thumbnail', 'imageurl']),
        }
        if (!columns.id || !columns.name) {
          console.warn(`  ⚠ ${file}: sin columnas de id y nombre reconocibles, se salta`)
        }
      }
      if (!columns.id || !columns.name) return

      const id = Number.parseInt(row[columns.id], 10)
      const name = row[columns.name]?.trim()
      if (!Number.isFinite(id) || id <= 0 || !name) return

      const image = columns.image ? row[columns.image]?.trim() : ''
      dump.add({
        id,
        name,
        rank: columns.rank ? Number.parseInt(row[columns.rank], 10) || 0 : 0,
        votes: columns.votes ? Number.parseInt(row[columns.votes], 10) || 0 : 0,
        image: image && image.startsWith('http') ? image : undefined,
      })
    })

    console.log(`  · ${file}: ${rows.toLocaleString('es')} filas`)
  }

  return dump
}
