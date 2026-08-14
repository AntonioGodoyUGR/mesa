-- =============================================================================
-- Mesa — esquema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Después ejecutar `supabase/seed_games.sql` (lo genera `npm run seed:games`).
--
-- Principio de diseño: el esquema NO conoce ningún juego concreto.
-- Los juegos y sus campos de puntuación son DATOS (`games`, `game_score_fields`),
-- sembrados desde las definiciones TypeScript de `src/games/definitions/`.
-- Añadir un juego nuevo no requiere ninguna migración.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Grupos privados
-- -----------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 60),
  join_code text not null unique,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on public.group_members (user_id);

-- -----------------------------------------------------------------------------
-- Jugadores
-- Entidad separada de `profiles` a propósito: un jugador puede ser un invitado
-- sin cuenta (`user_id is null`) y aun así acumular histórico y estadísticas.
-- Si más tarde se registra, se le asigna el `user_id` y conserva todo lo jugado.
-- -----------------------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 40),
  avatar_url text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists players_group_idx on public.players (group_id);
create unique index if not exists players_unique_name_per_group
  on public.players (group_id, lower(display_name));
create unique index if not exists players_unique_user_per_group
  on public.players (group_id, user_id)
  where user_id is not null;

-- -----------------------------------------------------------------------------
-- Catálogo de juegos (sembrado desde TypeScript)
-- -----------------------------------------------------------------------------
create table if not exists public.games (
  slug text primary key,
  name text not null,
  icon text not null,
  tagline text,
  theme jsonb not null default '{}'::jsonb,
  min_players int not null default 2,
  max_players int not null default 8,
  score_label text not null,
  score_label_short text not null,
  total_mode text not null check (total_mode in ('computed', 'explicit')),
  winner_rule text not null check (winner_rule in ('highest', 'lowest')),
  target_score int,
  sort_order int not null default 0,
  -- Copia íntegra de la definición TS, incluida la chuleta de reglas.
  definition jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.game_score_fields (
  game_slug text not null references public.games (slug) on delete cascade,
  field_key text not null,
  label text not null,
  short text,
  icon text not null,
  field_type text not null check (field_type in ('counter', 'number', 'toggle')),
  points numeric,
  is_total boolean not null default false,
  field_group text,
  min_value numeric,
  max_value numeric,
  unique_per_match boolean not null default false,
  show_in_summary boolean not null default false,
  hint text,
  sort_order int not null default 0,
  primary key (game_slug, field_key)
);

-- -----------------------------------------------------------------------------
-- Juegos creados por los usuarios
--
-- No hay tabla aparte a propósito: un juego de grupo es una fila más de `games`,
-- así `matches.game_slug`, `compute_match_total()` y `save_match()` funcionan con
-- él sin ningún caso especial. Lo único que lo distingue es `group_id` (quién lo
-- ve) y el prefijo `c-` del slug, que reserva el espacio de nombres del catálogo
-- oficial para que un juego integrado futuro no pise el de nadie.
-- -----------------------------------------------------------------------------
alter table public.games add column if not exists group_id uuid
  references public.groups (id) on delete cascade;
alter table public.games add column if not exists created_by uuid
  references auth.users (id) on delete set null;
alter table public.games add column if not exists image_url text;

alter table public.games drop constraint if exists games_custom_slug_prefix;
alter table public.games add constraint games_custom_slug_prefix
  check ((group_id is null) = (slug not like 'c-%'));

create index if not exists games_group_idx on public.games (group_id);

-- -----------------------------------------------------------------------------
-- Biblioteca personal: qué juegos ha comprado cada uno y cuáles desea.
--
-- Cuelga de la CUENTA y no del grupo a propósito: la caja está en tu estantería
-- juegues con quien juegues. Un juego solo puede estar en un estado (la clave
-- primaria es user+juego), porque lo comprado deja de estar deseado.
-- -----------------------------------------------------------------------------
create table if not exists public.game_library (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_slug text not null references public.games (slug) on delete cascade,
  status text not null check (status in ('owned', 'wishlist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_slug)
);

create index if not exists game_library_user_idx
  on public.game_library (user_id, status);

-- -----------------------------------------------------------------------------
-- Partidas
-- -----------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  game_slug text not null references public.games (slug) on delete restrict,
  played_at date not null default current_date,
  notes text,
  winner_player_id uuid,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_group_played_idx
  on public.matches (group_id, played_at desc, created_at desc);
create index if not exists matches_game_idx on public.matches (game_slug);

create table if not exists public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete restrict,
  seat int not null default 0,
  -- Puntuaciones indexadas por `ScoreField.field_key`: {"settlements": 3, "cities": 2}
  scores jsonb not null default '{}'::jsonb,
  total int not null default 0,
  rank int not null default 0,
  is_winner boolean not null default false,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index if not exists match_players_match_idx on public.match_players (match_id);
create index if not exists match_players_player_idx on public.match_players (player_id);

alter table public.matches
  drop constraint if exists matches_winner_player_id_fkey;
alter table public.matches
  add constraint matches_winner_player_id_fkey
  foreign key (winner_player_id) references public.players (id) on delete set null;

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at before update on public.groups
  for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

drop trigger if exists game_library_set_updated_at on public.game_library;
create trigger game_library_set_updated_at before update on public.game_library
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Perfil automático al registrarse
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  -- Si alguien ya jugaba como invitado con ese correo apuntado, aquí se podría
  -- vincular; de momento la vinculación se hace a mano desde la pantalla de grupo.
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Helpers de pertenencia
-- `security definer` es imprescindible: sin él, las policies sobre
-- `group_members` se consultarían a sí mismas y Postgres daría recursión infinita.
-- -----------------------------------------------------------------------------
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_admin(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Cálculo del total EN LA BASE DE DATOS, leyendo la misma configuración que la UI.
-- Es la contrapartida de `computeTotal()` en src/games/registry.ts: el cliente
-- calcula para mostrar, el servidor recalcula para guardar. Nadie hardcodea reglas.
-- -----------------------------------------------------------------------------
create or replace function public.compute_match_total(p_game_slug text, p_scores jsonb)
returns int language sql stable set search_path = public as $$
  select coalesce(sum(
    case f.field_type
      when 'toggle' then
        (case when coalesce((p_scores ->> f.field_key)::boolean, false) then 1 else 0 end)
      else
        coalesce(nullif(p_scores ->> f.field_key, '')::numeric, 0)
    end * coalesce(f.points, 1)
  ), 0)::int
  from public.game_score_fields f
  join public.games g on g.slug = f.game_slug
  where f.game_slug = p_game_slug
    and (
      (g.total_mode = 'computed' and f.points is not null)
      or (g.total_mode = 'explicit' and f.is_total)
    );
$$;

-- -----------------------------------------------------------------------------
-- Crear grupo (y dar de alta al creador como jugador)
-- -----------------------------------------------------------------------------
create or replace function public.create_group(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_group_id uuid;
  v_code text;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesión para crear un grupo';
  end if;

  -- Código de 6 caracteres sin vocales (evita palabras accidentales) ni 0/O/1/I.
  loop
    v_code := string_agg(
      substr('BCDFGHJKLMNPQRSTVWXYZ23456789',
             floor(random() * 29 + 1)::int, 1), ''
    ) from generate_series(1, 6);
    exit when not exists (select 1 from public.groups where join_code = v_code);
  end loop;

  insert into public.groups (name, join_code, created_by)
  values (trim(p_name), v_code, auth.uid())
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'admin');

  select coalesce(nullif(trim(display_name), ''), 'Yo')
    into v_name from public.profiles where id = auth.uid();

  insert into public.players (group_id, display_name, user_id)
  values (v_group_id, coalesce(v_name, 'Yo'), auth.uid())
  on conflict do nothing;

  return v_group_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Unirse a un grupo por código
-- `security definer` permite localizar el grupo por su código sin exponer
-- la tabla `groups` entera a quien no es miembro.
-- -----------------------------------------------------------------------------
create or replace function public.join_group(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_group_id uuid;
  v_name text;
  v_player_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesión para unirse a un grupo';
  end if;

  select id into v_group_id
  from public.groups
  where upper(join_code) = upper(trim(p_code));

  if v_group_id is null then
    raise exception 'No existe ningún grupo con el código %', upper(trim(p_code))
      using errcode = 'no_data_found';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  select coalesce(nullif(trim(display_name), ''), 'Jugador')
    into v_name from public.profiles where id = auth.uid();

  -- Si ya existía un jugador invitado con ese mismo nombre, se vincula a la
  -- cuenta en vez de crear un duplicado: así se conserva su histórico.
  select id into v_player_id
  from public.players
  where group_id = v_group_id
    and user_id is null
    and lower(display_name) = lower(v_name);

  if v_player_id is not null then
    update public.players set user_id = auth.uid() where id = v_player_id;
  else
    insert into public.players (group_id, display_name, user_id)
    values (v_group_id, v_name, auth.uid())
    on conflict do nothing;
  end if;

  return v_group_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Guardar una partida completa en una sola transacción.
--
-- Se hace con una función y no con inserts sueltos porque hay que garantizar
-- de forma atómica que:
--   · todos los jugadores pertenecen al grupo,
--   · al menos uno tiene cuenta registrada (sin máximo),
--   · el número de jugadores encaja con el juego,
--   · los totales y posiciones se calculan con la configuración del servidor.
--
-- p_players: [{"player_id": uuid, "seat": 0, "scores": {...}}, ...]
-- -----------------------------------------------------------------------------
create or replace function public.save_match(
  p_group_id uuid,
  p_game_slug text,
  p_played_at date,
  p_notes text,
  p_players jsonb,
  p_winner_player_id uuid default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_match_id uuid;
  v_game public.games%rowtype;
  v_count int;
  v_registered int;
  v_foreign int;
  v_winner uuid;
begin
  if not public.is_group_member(p_group_id) then
    raise exception 'No perteneces a este grupo';
  end if;

  select * into v_game from public.games where slug = p_game_slug;
  if v_game.slug is null then
    raise exception 'Juego desconocido: %', p_game_slug;
  end if;

  -- Un juego creado por otro grupo no se puede usar aquí (la función es
  -- `security definer`, así que la RLS de `games` no protege esta lectura).
  if v_game.group_id is not null and v_game.group_id <> p_group_id then
    raise exception 'Ese juego pertenece a otro grupo';
  end if;

  v_count := coalesce(jsonb_array_length(p_players), 0);
  if v_count < v_game.min_players or v_count > v_game.max_players then
    raise exception '% admite entre % y % jugadores (recibidos %)',
      v_game.name, v_game.min_players, v_game.max_players, v_count;
  end if;

  -- Todos los jugadores tienen que ser de este grupo.
  select count(*) into v_foreign
  from jsonb_array_elements(p_players) e
  left join public.players pl on pl.id = (e ->> 'player_id')::uuid
  where pl.id is null or pl.group_id <> p_group_id;

  if v_foreign > 0 then
    raise exception 'Hay jugadores que no pertenecen a este grupo';
  end if;

  -- Regla del producto: al menos un jugador con cuenta, sin límite máximo.
  select count(*) into v_registered
  from jsonb_array_elements(p_players) e
  join public.players pl on pl.id = (e ->> 'player_id')::uuid
  where pl.user_id is not null;

  if v_registered < 1 then
    raise exception 'La partida necesita al menos un jugador con cuenta registrada';
  end if;

  insert into public.matches (group_id, game_slug, played_at, notes, created_by)
  values (
    p_group_id,
    p_game_slug,
    coalesce(p_played_at, current_date),
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning id into v_match_id;

  insert into public.match_players (match_id, player_id, seat, scores, total)
  select
    v_match_id,
    (e ->> 'player_id')::uuid,
    coalesce((e ->> 'seat')::int, (ord - 1)::int),
    coalesce(e -> 'scores', '{}'::jsonb),
    public.compute_match_total(p_game_slug, coalesce(e -> 'scores', '{}'::jsonb))
  from jsonb_array_elements(p_players) with ordinality as t(e, ord);

  -- Posiciones según el criterio del juego (los empates comparten posición).
  with ranked as (
    select
      id,
      rank() over (
        order by case when v_game.winner_rule = 'lowest' then total else -total end
      ) as position
    from public.match_players
    where match_id = v_match_id
  )
  update public.match_players mp
  set rank = ranked.position
  from ranked
  where mp.id = ranked.id;

  -- Ganador: el indicado a mano (para desempates) o el primero de la clasificación.
  if p_winner_player_id is not null then
    v_winner := p_winner_player_id;
  else
    select player_id into v_winner
    from public.match_players
    where match_id = v_match_id and rank = 1
    limit 1;
  end if;

  update public.match_players
  set is_winner = (player_id = v_winner)
  where match_id = v_match_id;

  update public.matches set winner_player_id = v_winner where id = v_match_id;

  return v_match_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Crear o actualizar un juego del grupo.
--
-- Va por función y no por inserts sueltos por el mismo motivo que `save_match`:
-- hay que escribir `games` Y `game_score_fields` de forma atómica. La segunda
-- tabla no es un adorno: es de donde `compute_match_total()` saca las reglas al
-- guardar una partida, así que un juego sin sus campos daría totales a cero.
--
-- p_definition es la `GameDefinition` entera (la misma que usa la interfaz).
-- Devuelve el slug, que en un juego nuevo lo genera esta función.
-- -----------------------------------------------------------------------------
create or replace function public.save_custom_game(
  p_group_id uuid,
  p_definition jsonb,
  p_slug text default null
)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_slug text;
  v_base text;
  v_name text;
  v_fields jsonb;
  v_field_count int;
  v_existing public.games%rowtype;
begin
  if not public.is_group_member(p_group_id) then
    raise exception 'No perteneces a este grupo';
  end if;

  v_name := trim(coalesce(p_definition ->> 'name', ''));
  if v_name = '' then
    raise exception 'El juego necesita un nombre';
  end if;

  v_fields := p_definition -> 'fields';
  v_field_count := coalesce(jsonb_array_length(v_fields), 0);
  if v_field_count < 1 or v_field_count > 12 then
    raise exception 'Un juego necesita entre 1 y 12 campos de puntuación (recibidos %)',
      v_field_count;
  end if;

  if (p_definition ->> 'totalMode') not in ('computed', 'explicit') then
    raise exception 'Sistema de puntuación no válido';
  end if;

  if (p_definition ->> 'winnerRule') not in ('highest', 'lowest') then
    raise exception 'Criterio de victoria no válido';
  end if;

  if p_slug is null then
    -- Slug nuevo: c- + nombre saneado + sufijo aleatorio hasta que esté libre.
    v_base := nullif(trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g')), '');
    v_base := left(coalesce(v_base, 'juego'), 32);
    loop
      v_slug := 'c-' || v_base || '-' || substr(md5(random()::text), 1, 4);
      exit when not exists (select 1 from public.games where slug = v_slug);
    end loop;
  else
    v_slug := p_slug;
    select * into v_existing from public.games where slug = v_slug;
    if v_existing.slug is null then
      raise exception 'Juego desconocido: %', v_slug;
    end if;
    if v_existing.group_id is null or v_existing.group_id <> p_group_id then
      raise exception 'Ese juego no es de este grupo';
    end if;
  end if;

  insert into public.games (
    slug, name, icon, tagline, theme, min_players, max_players,
    score_label, score_label_short, total_mode, winner_rule, target_score,
    sort_order, definition, group_id, created_by, image_url
  ) values (
    v_slug,
    v_name,
    coalesce(nullif(p_definition ->> 'icon', ''), '🎲'),
    nullif(p_definition ->> 'tagline', ''),
    coalesce(p_definition -> 'theme', '{}'::jsonb),
    coalesce((p_definition ->> 'minPlayers')::int, 2),
    coalesce((p_definition ->> 'maxPlayers')::int, 8),
    coalesce(nullif(p_definition ->> 'scoreLabel', ''), 'Puntos'),
    coalesce(nullif(p_definition ->> 'scoreLabelShort', ''), 'Pts'),
    p_definition ->> 'totalMode',
    p_definition ->> 'winnerRule',
    nullif(p_definition ->> 'targetScore', '')::int,
    1000,
    p_definition,
    p_group_id,
    auth.uid(),
    nullif(p_definition ->> 'imageUrl', '')
  )
  on conflict (slug) do update set
    name = excluded.name,
    icon = excluded.icon,
    tagline = excluded.tagline,
    theme = excluded.theme,
    min_players = excluded.min_players,
    max_players = excluded.max_players,
    score_label = excluded.score_label,
    score_label_short = excluded.score_label_short,
    total_mode = excluded.total_mode,
    winner_rule = excluded.winner_rule,
    target_score = excluded.target_score,
    definition = excluded.definition,
    image_url = excluded.image_url,
    updated_at = now();

  insert into public.game_score_fields (
    game_slug, field_key, label, short, icon, field_type, points, is_total,
    field_group, min_value, max_value, unique_per_match, show_in_summary,
    hint, sort_order
  )
  select
    v_slug,
    f ->> 'key',
    f ->> 'label',
    nullif(f ->> 'short', ''),
    coalesce(nullif(f ->> 'icon', ''), '🔢'),
    f ->> 'type',
    nullif(f ->> 'points', '')::numeric,
    coalesce((f ->> 'isTotal')::boolean, false),
    nullif(f ->> 'group', ''),
    nullif(f ->> 'min', '')::numeric,
    nullif(f ->> 'max', '')::numeric,
    coalesce((f ->> 'uniquePerMatch')::boolean, false),
    coalesce((f ->> 'showInSummary')::boolean, false),
    nullif(f ->> 'hint', ''),
    (ord - 1)::int
  from jsonb_array_elements(v_fields) with ordinality as t(f, ord)
  on conflict (game_slug, field_key) do update set
    label = excluded.label,
    short = excluded.short,
    icon = excluded.icon,
    field_type = excluded.field_type,
    points = excluded.points,
    is_total = excluded.is_total,
    field_group = excluded.field_group,
    min_value = excluded.min_value,
    max_value = excluded.max_value,
    unique_per_match = excluded.unique_per_match,
    show_in_summary = excluded.show_in_summary,
    hint = excluded.hint,
    sort_order = excluded.sort_order;

  -- Campos retirados en la edición. Las partidas ya guardadas conservan su jsonb:
  -- simplemente dejan de mostrarse.
  delete from public.game_score_fields f
  where f.game_slug = v_slug
    and not exists (
      select 1 from jsonb_array_elements(v_fields) as e
      where e ->> 'key' = f.field_key
    );

  return v_slug;
end;
$$;

-- -----------------------------------------------------------------------------
-- Borrar un juego del grupo. Solo si nadie ha apuntado partidas con él:
-- la FK de `matches` es `on delete restrict`, así que sin esta comprobación
-- el usuario vería un error de Postgres en crudo.
-- -----------------------------------------------------------------------------
create or replace function public.delete_custom_game(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_game public.games%rowtype;
  v_matches int;
begin
  select * into v_game from public.games where slug = p_slug;
  if v_game.slug is null then
    raise exception 'Juego desconocido: %', p_slug;
  end if;

  if v_game.group_id is null then
    raise exception 'Los juegos del catálogo no se pueden borrar';
  end if;

  if not public.is_group_member(v_game.group_id) then
    raise exception 'No perteneces a este grupo';
  end if;

  select count(*) into v_matches from public.matches where game_slug = p_slug;
  if v_matches > 0 then
    raise exception 'No se puede borrar: hay % partida(s) apuntadas con este juego', v_matches;
  end if;

  delete from public.games where slug = p_slug;
end;
$$;

-- -----------------------------------------------------------------------------
-- Estadísticas globales de un juego, para su ficha.
--
-- Las partidas están recortadas por RLS al grupo de cada uno, así que un `select`
-- normal nunca vería más allá de las tuyas. Esta función es `security definer`
-- a propósito: se salta la RLS para contar, pero devuelve ÚNICAMENTE agregados
-- —cuántas partidas, cuántos grupos, medias— y ni un nombre, ni un id de grupo,
-- ni uno de jugador. Es lo que permite enseñar «así se juega a esto en Mesa» sin
-- filtrar nada de nadie.
--
-- La ejecuta también `anon`: la ficha de un juego se consulta sin sesión, igual
-- que su chuleta de reglas.
-- -----------------------------------------------------------------------------
create or replace function public.game_global_stats(p_game_slug text)
returns table (
  matches bigint,
  groups bigint,
  players bigint,
  average_players numeric,
  average_total numeric,
  best_total int,
  last_played_at date
)
language sql security definer stable set search_path = public as $$
  with played as (
    select m.id, m.group_id, m.played_at
    from public.matches m
    where m.game_slug = p_game_slug
  ),
  entries as (
    select mp.match_id, mp.player_id, mp.total
    from public.match_players mp
    join played on played.id = mp.match_id
  ),
  per_match as (
    select count(*)::numeric as seats from entries group by match_id
  )
  select
    (select count(*) from played),
    (select count(distinct group_id) from played),
    (select count(distinct player_id) from entries),
    (select round(avg(seats), 1) from per_match),
    (select round(avg(total), 1) from entries),
    -- «Mejor» depende del juego: en los de menos-es-más el récord es el mínimo.
    (select case
       when (select winner_rule from public.games where slug = p_game_slug) = 'lowest'
         then min(total)
       else max(total)
     end from entries),
    (select max(played_at) from played);
$$;

-- Sin esto un visitante sin cuenta no podría abrir la ficha de un juego.
grant execute on function public.game_global_stats(text) to anon, authenticated;

-- =============================================================================
-- Row Level Security — todo se recorta por pertenencia al grupo
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.games enable row level security;
alter table public.game_score_fields enable row level security;
alter table public.game_library enable row level security;

-- Perfiles: cada uno gestiona el suyo; se leen los de tus compañeros de grupo.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members mine
      join public.group_members theirs on theirs.group_id = mine.group_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Grupos: solo los tuyos. El alta va por `create_group` / `join_group`.
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select to authenticated
  using (public.is_group_member(id));

drop policy if exists groups_update_admin on public.groups;
create policy groups_update_admin on public.groups for update to authenticated
  using (public.is_group_admin(id)) with check (public.is_group_admin(id));

drop policy if exists groups_delete_admin on public.groups;
create policy groups_delete_admin on public.groups for delete to authenticated
  using (public.is_group_admin(id));

-- Miembros
drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists group_members_leave on public.group_members;
create policy group_members_leave on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_group_admin(group_id));

-- Jugadores (incluidos los invitados sin cuenta)
drop policy if exists players_select on public.players;
create policy players_select on public.players for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists players_insert on public.players;
create policy players_insert on public.players for insert to authenticated
  with check (public.is_group_member(group_id));

drop policy if exists players_update on public.players;
create policy players_update on public.players for update to authenticated
  using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

drop policy if exists players_delete on public.players;
create policy players_delete on public.players for delete to authenticated
  using (public.is_group_admin(group_id));

-- Partidas
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists matches_update on public.matches;
create policy matches_update on public.matches for update to authenticated
  using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

drop policy if exists matches_delete on public.matches;
create policy matches_delete on public.matches for delete to authenticated
  using (created_by = auth.uid() or public.is_group_admin(group_id));

drop policy if exists match_players_select on public.match_players;
create policy match_players_select on public.match_players for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_players.match_id and public.is_group_member(m.group_id)
    )
  );

drop policy if exists match_players_update on public.match_players;
create policy match_players_update on public.match_players for update to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_players.match_id and public.is_group_member(m.group_id)
    )
  )
  with check (
    exists (
      select 1 from public.matches m
      where m.id = match_players.match_id and public.is_group_member(m.group_id)
    )
  );

-- Catálogo de juegos: el oficial (`group_id is null`) lo lee cualquiera, incluso
-- sin sesión —así se pueden consultar las reglas antes de entrar—; los juegos
-- creados por un grupo solo los ven sus miembros. La escritura no se abre a
-- nadie: va por `save_custom_game` / `delete_custom_game` y por el seed
-- (service role, que se salta la RLS).
drop policy if exists games_select on public.games;
create policy games_select on public.games for select
  to anon, authenticated
  using (group_id is null or public.is_group_member(group_id));

drop policy if exists game_score_fields_select on public.game_score_fields;
create policy game_score_fields_select on public.game_score_fields for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.games g
      where g.slug = game_score_fields.game_slug
        and (g.group_id is null or public.is_group_member(g.group_id))
    )
  );

-- Biblioteca: privada de cada cuenta, en los cuatro sentidos. Ni siquiera los
-- compañeros de grupo ven lo que tienes o lo que deseas.
drop policy if exists game_library_select on public.game_library;
create policy game_library_select on public.game_library for select to authenticated
  using (user_id = auth.uid());

drop policy if exists game_library_insert on public.game_library;
create policy game_library_insert on public.game_library for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists game_library_update on public.game_library;
create policy game_library_update on public.game_library for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists game_library_delete on public.game_library;
create policy game_library_delete on public.game_library for delete to authenticated
  using (user_id = auth.uid());

-- =============================================================================
-- Realtime: las partidas del grupo se actualizan solas en todos los móviles
-- =============================================================================
do $$
begin
  alter publication supabase_realtime add table public.matches;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.match_players;
exception when duplicate_object then null;
end $$;
