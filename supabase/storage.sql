-- =============================================================================
-- Mesa — almacenamiento de portadas de juegos
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query (después de schema.sql)
--
-- Las imágenes de los juegos que crean los usuarios van a un bucket público:
-- son portadas, no datos personales, y así la app puede pintarlas con una <img>
-- normal sin firmar URLs. Lo que sí se restringe es quién escribe: cada fichero
-- vive en una carpeta con el id de su grupo y solo los miembros pueden tocarla.
--
--   game-images/<group_id>/<uuid>.webp
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-images',
  'game-images',
  true,
  2097152, -- 2 MB: la app redimensiona a 512 px antes de subir
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Devuelve true si la primera carpeta de la ruta es un grupo del usuario.
-- La comprobación del formato evita que un nombre inventado reviente el cast.
create or replace function public.storage_path_is_my_group(p_name text)
returns boolean language sql stable set search_path = public as $$
  select
    coalesce((storage.foldername(p_name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', false)
    and public.is_group_member(((storage.foldername(p_name))[1])::uuid);
$$;

-- Lectura: pública (el bucket ya lo es; la policy lo deja explícito).
drop policy if exists game_images_read on storage.objects;
create policy game_images_read on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'game-images');

-- Escritura: solo en la carpeta de un grupo del que eres miembro.
drop policy if exists game_images_insert on storage.objects;
create policy game_images_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'game-images'
    and public.storage_path_is_my_group(name)
  );

drop policy if exists game_images_update on storage.objects;
create policy game_images_update on storage.objects for update
  to authenticated
  using (bucket_id = 'game-images' and public.storage_path_is_my_group(name))
  with check (bucket_id = 'game-images' and public.storage_path_is_my_group(name));

drop policy if exists game_images_delete on storage.objects;
create policy game_images_delete on storage.objects for delete
  to authenticated
  using (bucket_id = 'game-images' and public.storage_path_is_my_group(name));
