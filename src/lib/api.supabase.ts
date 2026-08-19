import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { toDefinition } from '../games/custom'
import { catalogGame } from '../games/registry'
import { CATALOG_PAGE } from '../games/filters'
import type { CatalogGameRow } from '../games/registry'
import type { GameDefinition } from '../games/types'
import type { TableTrackerApi } from './api'
import type {
  Group,
  GroupMember,
  LibraryEntry,
  MatchWithPlayers,
  Player,
  SessionUser,
} from './types'

function toSessionUser(user: User | null): SessionUser | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      (user.user_metadata?.display_name as string | undefined) ||
      user.email?.split('@')[0] ||
      'Jugador',
  }
}

/** Traduce los errores de Postgres a algo legible en pantalla. */
function fail(message: string, error: { message: string } | null): never {
  throw new Error(error?.message ? `${message}: ${error.message}` : message)
}

export const supabaseApi: TableTrackerApi = {
  async getUser() {
    const { data } = await supabase.auth.getUser()
    return toSessionUser(data.user)
  },

  onUserChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toSessionUser(session?.user ?? null))
    })
    return () => data.subscription.unsubscribe()
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) fail('No se ha podido iniciar sesión', error)
  },

  async signUp(email, password, displayName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    })
    if (error) fail('No se ha podido crear la cuenta', error)
  },

  async signOut() {
    await supabase.auth.signOut()
  },

  async listGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) fail('No se han podido cargar los grupos', error)
    return (data ?? []) as Group[]
  },

  async createGroup(name) {
    const { data: groupId, error } = await supabase.rpc('create_group', { p_name: name })
    if (error) fail('No se ha podido crear el grupo', error)

    const { data, error: readError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId as string)
      .single()
    if (readError) fail('Grupo creado pero no se ha podido leer', readError)
    return data as Group
  },

  async joinGroup(code) {
    const { data: groupId, error } = await supabase.rpc('join_group', { p_code: code })
    if (error) fail('No se ha podido unir al grupo', error)

    const { data, error: readError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId as string)
      .single()
    if (readError) fail('Te has unido pero no se ha podido leer el grupo', readError)
    return data as Group
  },

  async listMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, user_id, role, profile:profiles(id, display_name, avatar_url)')
      .eq('group_id', groupId)
    if (error) fail('No se han podido cargar los miembros', error)
    return (data ?? []) as unknown as GroupMember[]
  },

  async listPlayers(groupId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('group_id', groupId)
      .order('display_name')
    if (error) fail('No se han podido cargar los jugadores', error)
    return (data ?? []) as Player[]
  },

  async addPlayer(groupId, displayName) {
    const { data, error } = await supabase
      .from('players')
      .insert({ group_id: groupId, display_name: displayName.trim() })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') {
        throw new Error(`Ya hay un jugador llamado «${displayName.trim()}» en el grupo`)
      }
      fail('No se ha podido añadir el jugador', error)
    }
    return data as Player
  },

  async renamePlayer(playerId, displayName) {
    const { error } = await supabase
      .from('players')
      .update({ display_name: displayName.trim() })
      .eq('id', playerId)
    if (error) fail('No se ha podido renombrar al jugador', error)
  },

  async setPlayerAvatar(playerId, avatar) {
    const { error } = await supabase
      .from('players')
      .update({ avatar_url: avatar })
      .eq('id', playerId)
    if (error) fail('No se ha podido guardar el avatar', error)
  },

  async listMatches(groupId) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, match_players(*, player:players(*))')
      .eq('group_id', groupId)
      .order('played_at', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) fail('No se han podido cargar las partidas', error)

    return ((data ?? []) as unknown as MatchWithPlayers[]).map((match) => ({
      ...match,
      match_players: [...match.match_players].sort((a, b) => a.rank - b.rank || a.seat - b.seat),
    }))
  },

  async saveMatch(input) {
    // Una sola llamada: el servidor valida el grupo, exige al menos un jugador
    // con cuenta, recalcula los totales y reparte las posiciones de forma atómica.
    const { data, error } = await supabase.rpc('save_match', {
      p_group_id: input.groupId,
      p_game_slug: input.gameSlug,
      p_played_at: input.playedAt,
      p_notes: input.notes ?? null,
      p_players: input.players.map((player) => ({
        player_id: player.playerId,
        seat: player.seat,
        scores: player.scores,
      })),
      p_winner_player_id: input.winnerPlayerId ?? null,
    })
    if (error) fail('No se ha podido guardar la partida', error)
    return data as string
  },

  async deleteMatch(matchId) {
    const { error } = await supabase.from('matches').delete().eq('id', matchId)
    if (error) fail('No se ha podido borrar la partida', error)
  },

  async listGames(groupId) {
    // Solo los del grupo: el catálogo integrado ya viaja dentro del bundle.
    const { data, error } = await supabase
      .from('games')
      .select('slug, image_url, group_id, created_by, definition')
      .eq('group_id', groupId)
      .order('name')
    if (error) fail('No se han podido cargar los juegos del grupo', error)
    return (data ?? []).map(toDefinition)
  },

  async searchCatalog(query) {
    // Los filtros vacíos van como null y no como array vacío: es lo que la función
    // entiende por «este criterio no se ha puesto».
    const { data, error } = await supabase.rpc('search_catalog', {
      p_query: query.query?.trim() ?? '',
      p_limit: query.limit ?? CATALOG_PAGE,
      p_offset: query.offset ?? 0,
      p_players: query.players ?? null,
      p_durations: query.durations?.length ? query.durations : null,
      p_difficulties: query.difficulties?.length ? query.difficulties : null,
      p_group_id: query.groupId ?? null,
      p_slugs: query.slugs?.length ? query.slugs : null,
    })
    if (error) fail('No se ha podido buscar en el catálogo', error)
    return ((data ?? []) as CatalogGameRow[]).map(catalogGame)
  },

  async getGameBySlug(slug) {
    // Aquí sí viaja la definición entera: es una fila sola y es la pantalla donde se
    // leen las reglas. `rules` tiene columna propia desde que el catálogo creció;
    // las filas viejas la llevan todavía dentro de `definition`, así que vale la que
    // haya.
    const { data, error } = await supabase
      .from('games')
      .select('slug, image_url, group_id, created_by, definition, rules')
      .eq('slug', slug)
      .maybeSingle()
    if (error) fail('No se ha podido cargar el juego', error)
    if (!data) return null

    const game = toDefinition(data)
    const rules = (data.rules as GameDefinition['rules']) ?? game.rules
    return rules ? { ...game, rules } : game
  },

  async getGamesBySlugs(slugs) {
    if (slugs.length === 0) return []
    return supabaseApi.searchCatalog({ slugs, limit: slugs.length })
  },

  async saveCustomGame(input) {
    // El servidor escribe `games` y `game_score_fields` en la misma transacción:
    // sin la segunda, `compute_match_total` daría cero al guardar una partida.
    const { data, error } = await supabase.rpc('save_custom_game', {
      p_group_id: input.groupId,
      p_definition: input.definition,
      p_slug: input.slug ?? null,
    })
    if (error) fail('No se ha podido guardar el juego', error)
    return data as string
  },

  async deleteCustomGame(slug) {
    const { error } = await supabase.rpc('delete_custom_game', { p_slug: slug })
    if (error) fail('No se ha podido borrar el juego', error)
  },

  async uploadGameImage(groupId, file) {
    // La carpeta es el id del grupo: es lo que comprueba la policy del bucket.
    const extension = file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${groupId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('game-images')
      .upload(path, file, { contentType: file.type || 'image/webp', upsert: false })
    if (error) fail('No se ha podido subir la imagen', error)

    const { data } = supabase.storage.from('game-images').getPublicUrl(path)
    return data.publicUrl
  },

  async getGameStats(gameSlug) {
    // Función `security definer`: se salta la RLS para contar las partidas de
    // todos los grupos, pero solo devuelve agregados. Ver `supabase/schema.sql`.
    const { data, error } = await supabase
      .rpc('game_global_stats', { p_game_slug: gameSlug })
      .single()
    if (error) fail('No se han podido cargar las estadísticas del juego', error)

    const row = data as {
      matches: number | null
      groups: number | null
      players: number | null
      average_players: number | null
      average_total: number | null
      best_total: number | null
      last_played_at: string | null
    }

    return {
      gameSlug,
      matches: row.matches ?? 0,
      groups: row.groups ?? 0,
      players: row.players ?? 0,
      averagePlayers: row.average_players,
      averageTotal: row.average_total,
      bestTotal: row.best_total,
      lastPlayedAt: row.last_played_at,
    }
  },

  async listLibrary() {
    // Sin filtro por usuario: la RLS de `game_library` ya recorta a las filas propias.
    const { data, error } = await supabase
      .from('game_library')
      .select('user_id, game_slug, status, created_at')
      .order('created_at', { ascending: false })
    if (error) fail('No se ha podido cargar tu biblioteca', error)
    return (data ?? []) as LibraryEntry[]
  },

  async setLibraryStatus(gameSlug, status) {
    if (status === null) {
      const { error } = await supabase
        .from('game_library')
        .delete()
        .eq('game_slug', gameSlug)
      if (error) fail('No se ha podido quitar el juego de tu biblioteca', error)
      return
    }

    // `user_id` va explícito porque forma parte de la clave primaria del upsert;
    // la policy comprueba después que sea el de la sesión.
    const { data } = await supabase.auth.getUser()
    if (!data.user) throw new Error('Hay que iniciar sesión para usar la biblioteca')

    const { error } = await supabase
      .from('game_library')
      .upsert(
        { user_id: data.user.id, game_slug: gameSlug, status },
        { onConflict: 'user_id,game_slug' },
      )
    if (error) fail('No se ha podido guardar el juego en tu biblioteca', error)
  },
}
