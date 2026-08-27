# ESTADO.md — Puente entre sesiones

Este fichero es el **contexto compartido** entre quien trabaje en el proyecto: Gustavo
(asistente de Toni en OpenClaw/Telegram) y Claude en el terminal. El código y el historial
de git ya se comparten solos; esto guarda lo que _no_ vive en el código: el porqué, lo que
quedó a medias y lo siguiente que toca.

## Cómo se usa

- **Al empezar una tarea:** léelo entero. Mira también `git status` y `git log --oneline -5`.
- **Al terminar (o al dejarlo a medias):** actualiza «Estado actual» y «Pendiente». Deja
  una línea en la bitácora con la fecha.
- Sé breve y concreto. Esto no es un diario, es un relevo. Si algo ya está commiteado y
  cerrado, no hace falta que siga aquí.
- Reglas duraderas de _cómo_ se trabaja → van al `CLAUDE.md`, no aquí.

---

## Estado actual

- **ESPEJO DE CARÁTULAS, PASO 1 HECHO: los 17.944 originales están en disco
  (2026-08-20).** `npm run covers:original` (`scripts/fetch-originals.ts`) corrió entero:
  **17.904 descargadas de 17.904, cero fallos, 8,57 GB** (14.413 jpg, 3.529 png, 2 gif).
  Verificado después: el manifiesto y el disco cuadran fichero a fichero, ni un byte de
  desajuste, y las **17.944 abren con `sharp`** — ninguna es una página de error colada
  con `200 OK`. Doce imágenes las comparten dos juegos (ediciones distintas de lo mismo).
  Baja los originales tal como los sirve BGG. **Ojo: esto no toca la app.** La
  app sigue pintando el enlace a `cf.geekdo-images.com` exactamente igual que ayer; esto
  es solo la copia en local. Cómo se le sirven luego —espejo propio, CDN o nada— está sin
  decidir a propósito.
  - **Por qué el original y no una miniatura.** El original es el archivo y las derivadas
    se regeneran. El tamaño al que se pinta una portada se cambia diez veces; volver a
    bajarse 8,6 GB de BGG, no.
  - **Los números, ya reales y no estimados.** El original medio son **501 kB**, no los
    402 kB que daba la muestra de 30: se descarga por popularidad y el arte de los juegos
    top pesa más de la media. Total **8,57 GB**.
  - **Aviso para el paso 2: no todos los originales dan para 512 px.** El 16,1 % (2.886)
    tienen el lado corto por debajo de 512 px, y el 2,0 % (366) por debajo de 256. Una
    derivada de 256 px es segura; para la de 512 hace falta `withoutEnlargement` o se
    escalará hacia arriba una de cada seis.
  - **Lo que costaría cada derivada** (medido sobre 30 portadas por la tubería de
    `npm run covers`, WebP cuadrado q82):
    512 px = 47,3 kB (829 MB), 320 px = 21,9 kB (384 MB), 256 px = 15,1 kB (265 MB),
    200 px = 10,2 kB (179 MB). El par 256+512 son 1,09 GB, que
    cabe en el plan gratuito de Cloudflare R2 (10 GB y egreso cero) pero no en el de
    Supabase Storage (1 GB, y 5 GB/mes de egreso).
  - **Dónde caen:** `scripts/data/covers-original/` y el manifiesto
    `scripts/data/covers-original.manifest.json` (slug → URL, fichero, bytes, sha256).
    Está todo en `.gitignore`: no viaja por git, es una copia local.
  - **Reanudable**, y ya no hace falta volver a lanzarlo salvo que BGG cambie portadas:
    relanzarlo solo baja lo que falte. Vuelve a bajar una si BGG le cambió la URL o si el
    fichero desapareció del disco.
  - **Lo siguiente, cuando Toni decida:** generar las derivadas desde `scripts/data/` (ya
    sin red) y elegir dónde alojarlas. La app **no está tocada**: sigue enlazando a
    `cf.geekdo-images.com` igual que antes.
  - Lo puro está en `scripts/lib/originals.ts` y se testea sin red (13 tests): qué
    extensión le toca al fichero, si lo que llegó es una imagen de verdad —una página de
    error llega con `200 OK` y se guardaría igual— y qué queda por bajar.

- **TRES COSAS QUE DESTAPÓ MIRAR LAS PORTADAS, y siguen sin arreglar:**
  1. **El service worker no cachea ni una portada del catálogo.** La regla de
     `vite.config.ts` es `/\/covers\/[^/]+\.webp$/`: ruta local y `.webp`. Las de BGG
     son otro dominio y acaban en `.jpg`/`.png`. Las 17.944 quedan fuera de la PWA y no
     hay portadas sin red. Además `maxEntries: 500` desaloja en cuanto se pasa de 500.
  2. **La ficha de un juego de cola larga se baja el original.** En `api.supabase.ts:262`
     la cascada es `coverUrl(slug) ?? game.imageUrl ?? data.cover_url ?? data.cover_thumb_url`,
     y `cover_url` es `thing.image` sin redimensionar: 402 kB de media, con picos de 2 MB,
     para pintar un cuadrado. En la rejilla no pasa (`catalog.ts:352` usa la miniatura).
     Arreglo de una línea: poner la miniatura antes que el original.
  3. **De las 369 portadas de `public/covers/`, ~345 ya no las mira la rejilla.**
     `CURATED_GAMES` bajó a 24 con la fase 4 y `expandCatalogRow` no consulta `COVERS`;
     solo la ficha individual sigue prefiriéndolas. Son ~19 MB en el despliegue casi sin
     uso. `npm run covers` los podaría solo (tiene borrado de huérfanos), pero no se ha
     vuelto a lanzar desde la mudanza.

- **Sobre republicar esto, para que quede escrito.** Las imágenes las sirve BGG pero no
  son suyas: las suben los usuarios y los derechos son de editoriales e ilustradores, así
  que BGG tiene licencia para mostrarlas y no puede cedérnosla. Los datos factuales no
  tienen copyright, pero en la UE existe el derecho *sui generis* de base de datos, que
  protege la inversión en reunirla. Copia para servir a nuestros propios usuarios: riesgo
  bajo. API pública o dataset republicado: decisión aparte, y no tomada.

- **FASE 5 HECHA (código): el catálogo crece por donde se busca (2026-08-20).** Cuando el
  buscador devuelve menos de tres juegos y hay al menos tres letras escritas, la app le
  pregunta a BoardGameGeek por lo que falta, lo escribe en el catálogo y lo pinta. Es el
  último trozo del plan de escalado: las cinco fases están completas.
  - **EN PRODUCCIÓN desde el 2026-08-20**: Toni ejecutó los dos SQL (`search_catalog.sql`
    y `resolve_game.sql`) y desplegó la función desde el panel de Supabase.
  - ⚠️ **La función desplegada es una COPIA empaquetada, no el código del repo.** Se
    desplegó desde el panel (Edge Functions → Via Editor), cuyo editor es de un solo
    fichero, así que lo pegado es la salida de `npm run bundle:function`
    (`scripts/data/resolve-game.bundle.ts`). **Quien toque
    `supabase/functions/resolve-game/index.ts` o `_shared/` tiene que volver a generar el
    empaquetado y volver a pegarlo**, o el cambio se queda en el repositorio y no llega a
    producción. El panel tampoco guarda historial de esas ediciones.
  - **Qué hay nuevo.** `supabase/functions/resolve-game/` (la función), `catalog_misses` +
    `claim_catalog_lookup` + `resolve_catalog_games` en `supabase/schema.sql`, `resolveGame`
    en las **dos** implementaciones de la API, `needsBggLookup` en `filters.ts` y el enganche
    en `useCatalogSearch`.
  - **Tres frenos, y hacen falta los tres.** El límite de BGG (~1 petición cada 2 s) es del
    TOKEN, no de cada usuario: diez personas buscando a la vez son diez peticiones al mismo
    cubo. Por eso (1) el cliente solo pregunta si de verdad falta algo (`needsBggLookup`),
    (2) `claim_catalog_lookup` deja pasar cada consulta **una vez por semana** venga de quien
    venga —y ese apunte se hace ANTES de ir a BGG, no después—, y (3) la función lleva un
    contador por IP en su memoria, para el bucle accidental.
  - **El código se comparte entre Node y Deno, no se duplica.** `supabase/functions/_shared/`
    tiene el cliente de BGG y la traducción ficha → juego; `scripts/lib/` son ahora dos
    envoltorios finos. Un juego sale idéntico por la ingesta y por la función. Ojo: el
    módulo compartido importa `src/games/catalog.ts`, que está fuera de `supabase/`; la CLI
    lo admite, pero con una versión vieja el `deploy` se queja de que no encuentra el módulo.
  - **`resolveGame` es el único método de la API que se traga sus errores** en vez de llamar
    a `fail()`. A propósito: es un rescate, no un camino. Si la función no está, si BGG está
    caído o si toca el límite, la pantalla se queda como estaba y no enseña un error por algo
    que nadie ha pedido.
  - En modo demostración devuelve lista vacía: no hay token, y el catálogo son los 24 de
    siempre. Los tests siguen pasando sin red (194).

- **CATÁLOGO INGESTADO: 17.972 juegos en Postgres (2026-08-20).** La ingesta de verdad ya
  corrió: 23.269 fichas pedidas a BGG en 52 min, 17.886 escritas y 5.383 descartadas
  (expansiones y fichas sin nombre), cero avisos. Con las 100 de la repesca y lo que ya
  había, `public.games` tiene **17.972 juegos de catálogo, 17.944 con carátula de BGG y
  ninguno sin `search_text`**. Los escritos a mano conservan su ficha entera: Catan sigue
  con su icono, su hoja y su chuleta, y de BGG solo se le añadieron año, votos y portadas.
  - **`search_catalog` con el `order by` nuevo, ejecutado por Toni el 2026-08-20.** Antes,
    buscar «cata» en producción no devolvía Catan; ahora sí.
  - **Por qué cambia el orden.** Ordenar por `similarity()` compara el texto ENTERO
    —nombre + lema—, así que castiga los nombres largos: «catan economico negociacion»
    puntuaba por debajo de «catatac». Ahora manda que **empiece por lo escrito** y, entre
    esos, la popularidad. Empezar una palabra cualquiera cuenta igual que empezar la frase
    («tokyo» → King of Tokyo, no Tokyo Highway). `similarity()` nunca filtró nada —eso lo
    hace el `like` con el índice de trigramas—, así que no se pierde ningún resultado.
    `searchGames` en `registry.ts` ordena igual: misma regla en los dos sitios, como
    `compute_match_total`.
  - **Dos fallos que destapó el ensayo y ya están arreglados**: las claves de la tabla de
    categorías no eran los nombres reales de BGG (salía «Medical · Viajes» y «Movies / TV /
    Radio theme»), ahora están **las 84** con su nombre exacto; y un `--dry-run` guardaba el
    fichero de avance, con lo que la pasada de verdad se saltaba los juegos del ensayo —los
    más populares—. Se recuperaron con `--restart --limit=100`.
  - `scripts/data/ingest-bgg.progress.json` tiene 23.329 IDs y 17.972 slugs ya procesados:
    volver a lanzar `npm run ingest:bgg` no repite trabajo. Para rehacerlo todo, `--restart`.
  - **Y un tercer fallo, que solo se veía con el catálogo dentro: la rejilla se
    descuadraba.** `GameTile` daba `h-full` a la imagen dentro de una caja `aspect-square`
    de altura automática; un alto en porcentaje contra un padre de altura indefinida se
    resuelve como `auto`, así que mandaba el alto natural de la imagen. Con las 369
    portadas descargadas (512x512) coincidía por casualidad; las de BGG vienen en 200x150
    y estiraban la tarjeta. Ahora la imagen va `absolute inset-0` y la caja recorta.
  - **Probado en el navegador contra el Supabase de verdad**: «zombi» trae 24 juegos con
    su carátula de BGG y la rejilla cuadrada, `/juegos/zombie-dice` —cola larga pura—
    abre con portada, lema en español y «todavía no tiene chuleta», y escribir «carcass»
    dispara **una sola** llamada a `search_catalog`.

- **Escalar el catálogo: FASE 4 HECHA (2026-08-20).** El catálogo sale del bundle y entra
  la ingesta masiva. Ya no hay ningún dato de juego en la app salvo los 24 escritos a mano.
  - **`catalog.data.ts` y `catalog.rules.ts` se mudan a `scripts/`.** Dejan de ser dato de
    ejecución y pasan a ser **semilla**: los leen `npm run seed:games` y `npm run ingest:bgg`,
    y de ahí bajan a Postgres, que es de donde los busca la app. `src/games/rules.ts` borrado
    —ya no hay nada que cargar con `import()`, la chuleta viene en `games.rules`— y
    `RuleSheetView` la lee de `game.rules` con un `loading` que le pasa `useGame`.
    `BUILTIN_GAMES` = `CURATED_GAMES`: 24 juegos, y el resto del catálogo por red.
  - **`scripts/ingest-bgg.ts` (nuevo)**: `--min-votes=100 --limit=30000 --dry-run --restart`.
    Lee el volcado CSV de BGG (`scripts/data/`, en `.gitignore`), se queda con los más
    votados, pide sus fichas a la XML API en lotes de 20 con la pausa de 2 s de siempre y
    hace `upsert` a Supabase en tandas de 500 con la clave de servicio. **Reanudable**:
    apunta por dónde iba en `scripts/data/ingest-bgg.progress.json`. Un juego que ya está
    escrito a mano **no se pisa**: se le añaden solo `bgg_id`, `year`, `popularity` y las
    dos portadas. Coste estimado: ~50 min para 30.000 fichas.
  - **La traducción BGG → catálogo vive aparte, en `scripts/lib/bgg-games.ts`**, porque es lo
    único de la ingesta que se puede comprobar sin red (regla 3 del `CLAUDE.md`): categorías
    a lema en español, icono, peso a dificultad, mecánicas a hoja, y el slug. Ojo con el
    slug: `games_custom_slug_prefix` prohíbe que un juego de catálogo empiece por `c-`, así
    que «C&C: Ancients» sale como `bgg-c-c-ancients`. Testeado en `bgg-games.test.ts`.
  - **Las dos siembras comparten `scripts/lib/game-rows.ts`**: escriben la MISMA fila, una
    en SQL y otra por red. Y `seed-games.ts` ya **no pisa** lo que trajo la ingesta
    (`KEEP_IF_SET`: `coalesce` en las portadas y el año, `greatest` en la popularidad), que
    si no, volver a sembrar tras añadir un juego a mano dejaba el catálogo sin carátulas.
  - **Portadas sin forjar nada.** `bgg-api.ts` lee ahora `<thumbnail>` además de `<image>`,
    que son las dos URLs que **da BGG**: la grande para la ficha, la miniatura para la
    rejilla. Nada de inventarse una variante de Thumbor —van firmadas—, y la ingesta hace
    `HEAD` sobre una muestra de 20 antes de escribir nada: si falla más de la mitad, se
    planta. `getGameBySlug` ya trae `cover_url`/`cover_thumb_url`, así que un juego de la
    cola larga abierto por enlace directo sale con su caja y no con el emoji.
  - **Tests movidos de sitio, no borrados.** Las invariantes del catálogo amplio salen de
    `registry.test.ts` (que ya solo ve 24 juegos) y entran en **`scripts/seed.test.ts`**,
    del lado que las escribe: slugs únicos, nada que pise un juego a mano, lema y rangos
    posibles, campos no compartidos por referencia, columnas `not null` llenas y cada
    portada apuntando a un juego que existe. 189 tests en verde.
  - **Medido:** primera visita en **190 kB gzip** (era 205 tras la fase 1 y 261 al empezar).
    Comprobado que en `dist/` no aparece ni una fila del catálogo (`grep "Pandemic Legacy"`
    → nada).
  - ⚠️ **No hace falta ejecutar nada en Supabase**: las columnas que usa la ingesta ya
    entraron con la fase 2. Lo que sí necesita Toni para **lanzarla**: `BGG_API_TOKEN`,
    `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env` (ver `.env.example`) y el CSV del
    volcado oficial (gratis, pide cuenta) de `boardgamegeek.com/data_dumps/bg_ranks` en
    `scripts/data/`. Sin el CSV el script se planta y explica de dónde bajarlo: la XML API
    no tiene forma de listar «todos los juegos», solo de preguntar por ID.
  - ⚠️ **En modo demostración el catálogo amplio ya no existe.** Sin credenciales solo hay
    24 juegos. Es la contrapartida que Toni aceptó al elegir búsqueda toda en servidor, y
    está escrita en el test (`api.demo.test.ts`: `getGameBySlug('pandemic')` → `null`).

- **Escalar el catálogo: FASE 3 HECHA (2026-08-20).** La interfaz ya lee el catálogo de
  Postgres: el array completo de juegos **ya no existe** en ninguna parte del cliente.
  - **`src/context/GamesContext.tsx` reescrito.** Fuera `games` y `builtin`. Expone `custom`
    (los del grupo, que siguen siendo pocos), `getGame(slug)` —resuelve en tres pasos
    **síncronos**: juegos del grupo → los que viajan en la app → los que ya se trajeron del
    servidor (`remember`)— y `loading`. Tiene que seguir siendo síncrono porque una tarjeta
    de partida pinta el nombre de su juego sin poder esperar a nadie.
  - **Hooks nuevos, en ese mismo fichero**: `useCatalogSearch` (paginación de servidor con
    `useInfiniteQuery`, `staleTime` de 24 h, **debounce de 250 ms** en el texto y no en los
    chips, porque tocar un chip ya es una decisión tomada), `useGame` (uno, solo pide si no
    se puede resolver ya), `useGamesBySlugs` (varios en UNA petición) y `useMatchGames` (los
    juegos de una lista de partidas, de una tacada).
    ⚠️ `remember` solo apunta lo que no estaba y **devuelve el mismo mapa si no hay nada
    nuevo**: sin esa comparación, cada respuesta dispara un render que vuelve a apuntar lo
    mismo, y otro, y otro.
  - **`HomePage`**: la rejilla del catálogo y los resultados de búsqueda son ya la MISMA
    consulta al servidor (sin criterios, `search_catalog` devuelve el catálogo por
    popularidad). Lo que ya sale arriba —favoritos y juegos del grupo— se descuenta de la
    rejilla de abajo en el cliente, solo cuando no se está buscando.
  - **`LibraryPage`**: «En casa» y «Deseados» resuelven sus slugs con `useGamesBySlugs` y se
    siguen filtrando en memoria (son listas cortas); «Todos» es el catálogo por tandas.
  - **Un juego suelto, por `useGame`**: `GamePage`, `NewMatchPage`, `CustomGamePage` y
    `MatchDetailPage`. **Por lotes, con `useMatchGames`**: `MatchesPage`, `PlayersPage`,
    `HomePage` y `PlayerProfilePage`. Hoy no dispara ni una petición extra —el catálogo
    entero todavía viaja en la app—, pero sin esto un juego de la cola larga (fase 4 en
    adelante) saldría sin nombre. ⚠️ En `MatchDetailPage` la partida se busca **antes** de
    los `return` tempranos: de ella sale el slug, y los hooks no pueden quedar detrás.
  - **`ShowMore`** admite las dos paginaciones: `hidden` (lista en memoria, se sabe cuántos
    quedan) y `more` (servidor, solo se sabe si queda algo). **`GameFinder`**: `total` pasa a
    ser opcional y aparece «Más de N juegos» cuando quedan tandas — contar el catálogo entero
    sería una consulta aparte sobre decenas de miles de filas para un paréntesis.
  - **El catálogo NO se persiste en `localStorage`** (`shouldDehydrateQuery` en `main.tsx`):
    cada búsqueda es una clave distinta con sus fichas dentro y son 5 MB para toda la app.
    Volver a pedirlo es una consulta; recuperar partidas y biblioteca sin cobertura, no.
  - **Probado en el navegador contra el Supabase de verdad** (`npm run dev`, sin sesión):
    la portada trae 24 juegos por popularidad; escribir «catan» dispara **una sola** llamada
    a `search_catalog` y responde «1 juego»; «Ver más juegos» trae la segunda tanda;
    `/juegos/scythe` —que no tiene definición a mano— se resuelve por enlace directo; la
    chuleta de Carcassonne llega aparte; y la caché persistida se quedó en **1 kB sin
    ninguna clave `catalog`**. Todo en verde: lint 0, 161 tests, build OK.
- **Escalar el catálogo: FASE 2 HECHA (2026-08-19). Toni ya ejecutó los dos ficheros en su editor.**
  La base de datos deja de ser una copia del catálogo y pasa a ser **el original**. Lo hecho:
  - **`supabase/schema.sql`**: columnas nuevas en `public.games` (`bgg_id`, `year`,
    `sheet_id`, `min_time`, `max_time`, `difficulty`, `popularity`, `cover_url`,
    `cover_thumb_url`, `rules`, `search_text`), sus dos `check`, la extensión `pg_trgm`, el
    índice GIN `games_search_trgm` sobre `search_text` y `games_catalog_order_idx` para el
    orden por popularidad. Todo `if not exists`: el fichero **sigue siendo idempotente** y se
    puede volver a lanzar entero.
  - **`public.searchable(text)` en SQL es gemela de la de `registry.ts`** (sin tildes, sin
    signos, minúsculas). Misma situación que `compute_match_total`: la regla está a propósito
    en los dos sitios y **si cambia una, cambia la otra**. No se usa en ningún índice ni
    columna generada, para que `create or replace` no se quede bloqueado por dependencias.
  - **RPC `search_catalog`**: `stable`, `security invoker` (la policy `games_select` ya deja
    leer a `anon` lo que tenga `group_id is null`), concedida a `anon` y `authenticated`.
    Filtra con `like '%…%'` sobre `search_text` —exactamente el mismo `includes` de antes,
    para que buscar dé lo mismo en servidor y en demostración— y usa `similarity()` **solo
    para ordenar**. Acepta los mismos criterios que la pantalla (texto, jugadores, tramos de
    duración, dificultad) más `p_group_id` y `p_slugs`, y devuelve `definition` **solo** para
    los juegos de grupo: los del catálogo se reconstruyen en el cliente.
  - **`catalogGame(row)` (`registry.ts`) es la costura.** Una fila de ~150 B vuelve a ser un
    `GameDefinition` completo porque las 5 hojas genéricas y las 16 paletas son **código** y
    ya viajan en el bundle (`expandCatalogRow` en `catalog.ts`). Si el juego está entre los
    que viajan en la app, manda el del bundle. Ningún componente se entera de dónde salió.
  - **`TableTrackerApi` con tres métodos nuevos** —`searchCatalog`, `getGameBySlug`,
    `getGamesBySlugs`— **implementados en las dos** (`api.supabase.ts` habla con la RPC;
    `api.demo.ts` filtra en memoria con `filterGames` sobre `BUILTIN_GAMES` + los juegos del
    grupo, y resuelve la chuleta con `loadRules()`). Claves nuevas en `queryKeys`: `catalog`
    (la consulta **es** la clave, para que miles de personas buscando lo mismo compartan
    respuesta), `game` y `gamesBySlugs` (con los slugs ordenados). `CatalogQuery` vive en
    `lib/types.ts`; `CATALOG_PAGE = 24` en `games/filters.ts` y no en `ShowMore.tsx`, porque
    ahí lo importaría `api.supabase.ts` y se cerraría un ciclo de módulos real.
  - **`save_custom_game` también rellena** `min_time`, `max_time`, `difficulty`, `rules` y
    `search_text`: sin eso, un juego creado por un grupo se guardaba pero no aparecía al
    buscar. Y `schema.sql` trae un **relleno idempotente** que arregla las filas que ya
    existan.
  - **`npm run seed:games` regenerado** (560 → 723 kB): siembra las seis columnas nuevas.
    ⚠️ **`sheet_id` no se puede deducir de `definition`**, así que volver a pasar el seed no
    es opcional si se quiere que el catálogo amplio se reconstruya bien desde la BD.
  - ⚠️ **Lo que TIENE que ejecutar Toni en su SQL Editor, en este orden:** `supabase/schema.sql`
    entero y después `supabase/seed_games.sql` entero. Hasta entonces la app sigue funcionando
    igual, porque la fase 3 (que es la que empieza a *leer* de ahí) aún no está.
    Para comprobar que el índice entra: `explain analyze select * from search_catalog('cata', 24, 0);`
    no debe hacer `seq scan` — medido con la tabla ya poblada, no con 393 filas.
  - Nada de esto cambia todavía ninguna pantalla: la interfaz sigue leyendo del bundle hasta
    la fase 3.
- **Escalar el catálogo a decenas de miles: FASE 1 HECHA (2026-08-19)**. Sale de una
  pregunta de Toni: cómo cargar los juegos si el catálogo crece a decenas de miles y la app
  ha de aguantar miles de usuarios a la vez. El plan aprobado está en
  `~/.claude/plans/teniendo-en-cuenta-como-concurrent-stallman.md` y **decidió Toni**:
  ~20-30k juegos por ingesta previa de BGG filtrada por votos **y además** crecimiento bajo
  demanda; portadas **enlazadas** a la CDN de BGG (nada de pagar almacenamiento); búsqueda
  **toda al servidor**, aceptando perder la exploración del catálogo sin conexión.
  El diagnóstico en una línea: la app no tiene un problema de catálogo, tiene el catálogo
  **dentro** —~308 kB de los ~350 kB de código propio eran datos de juegos.
  De la fase 1 (adelgazar el bundle, sin tocar la BD) queda hecho:
  - **`catalog.rules.ts` fuera del arranque.** `catalog.ts` ya **no** engancha
    `rules` al expandir: se queda en `undefined` a propósito, incluso para los juegos que sí
    tienen chuleta. Las resuelve **`src/games/rules.ts`** (nuevo) con un `import()` a
    demanda, con caché y sin descargas duplicadas (`loadRules`, `ruleSheetOf`,
    `needsRuleLoad`). Quien lo usa es `RuleSheetView`, con un hook privado `useRuleSheet`:
    así `GamePage` y `CustomGamePage` no se enteran. Son 67 kB (23 gzip) que ya no viajan
    en la primera visita.
  - **Portadas partidas en dos.** `src/games/covers.generated.ts` pasó de 83 kB a 19 kB:
    ahora es `Record<slug, string>` a secas. `source` y `sourceUrl` son **procedencia, no
    dato de ejecución**, y se han ido a **`scripts/covers.sources.generated.ts`** (nuevo,
    67 kB), que no importa nadie de `src/`. `npm run covers` escribe los dos.
  - **Una ruta, un trozo de JavaScript.** `React.lazy` para las once páginas en `App.tsx`;
    la portada (`HomePage`) se queda estática porque es donde cae todo el mundo. El
    `<Suspense>` va en `Layout`, alrededor del `<Outlet />`, para que la cabecera y la barra
    de secciones no parpadeen.
  - **Medido:** carga inicial de **262 → 205 kB gzip (−22 %)**, y 36 entradas de precache
    en vez de 18. El «~120 kB» que estimaba el plan **no era alcanzable en esta fase**: lo
    que queda son 74 gzip de React DOM (suelo irreducible), el cliente de Supabase, y ~20
    gzip de `catalog.data.ts` + 24 de las definiciones a mano, que no se van hasta que el
    catálogo se sirva desde Postgres (fases 2 y 3).
  - ⚠️ **Efecto secundario que hay que conocer:** con las rutas diferidas, React deja a la
    vista la **pantalla anterior** mientras llega el trozo nuevo (no enseña el `Suspense`).
    Es mejor UX, pero rompió una prueba que buscaba un encabezado justo después de navegar
    y encontraba el de la pantalla de la que venía. Al escribir pruebas de navegación hay
    que anclar la espera a algo que **solo** exista en la pantalla de destino.
  - ⚠️ **`supabase/seed_games.sql` regenerado, y no era inocuo.** La bitácora del 2026-08-16
    daba por hecho que las chuletas del catálogo «no tocan BD»; es **falso**: `seed-games.ts`
    serializa la `GameDefinition` entera en `definition` jsonb, chuleta incluida. Como nadie
    volvió a lanzar `npm run seed:games` desde entonces, el fichero llevaba desde agosto con
    24 chuletas cuando el TypeScript ya tenía 74. Ahora `seed-games.ts` engancha
    `CATALOG_RULES` por su cuenta (`withRules`) —en Node el peso da igual— y el fichero sale
    con las 74. Comprobado que **el único cambio** son esas 50 chuletas: quitándolas de los
    dos ficheros, son idénticos byte a byte. **Ejecutarlo en Supabase es opcional hoy**,
    porque la app lee las reglas del TypeScript y nadie mira `definition.rules`; la fase 2
    las mueve a una columna `games.rules` propia.
- **Cribado de portadas con personas (2026-08-19)**. Toni pidió quitar las carátulas
  «donde aparezcan personas» y, al aclararlo, fijó el criterio: **personas REALES**
  (fotografías); si son personajes dibujados de la propia carátula del juego, se quedan.
  Se revisaron las 368 portadas montando hojas de contactos con `sharp` (25 por lámina).
  Resultado: **solo una** incumplía —«Obsession», que colgaba la foto de un juego de
  madera de los setenta rodeada de fotos de gente— y la causa no era la portada sino el
  **ID de BGG** (12568, un homónimo). De paso salieron tres más igual de mal
  identificadas, sin personas: «Canvas» (el de 2010 en vez del de 2021), «The Game»
  («Wikipedia: The Game About Everything») y «Backgammon» («Zocken»). Los cuatro IDs
  corregidos en `scripts/bgg-ids.overrides.ts` —que es donde se arregla esto, no en
  `covers.overrides.ts`: si el ID es el bueno, la portada viene sola— y regenerados
  `npm run ids` (367/393 con ID, uno nuevo de propina: `iss-vanguard`) y `npm run covers`
  (369/393 con portada). Lo que **no** se tocó, por el criterio de arriba: Power Grid
  (el ingeniero de la edición «Recharged»), 7 Wonders (el Coloso), Código Secreto (los
  dos espías), King of Tokyo y Dixit, que Toni había citado como ejemplos. Si algún día
  se quiere la edición sin figuras, la API las da: `thing?id=<id>&versions=1` lista todas
  las ediciones con su imagen (la primera inglesa de Power Grid, 2004, son torres de alta
  tensión sin nadie).
- **Las portadas viejas se quedaban pegadas en el móvil (2026-08-19)**. Toni seguía
  viendo fotos de gente jugando en Rummikub, King of Tokyo, Dixit, Código Secreto,
  Power Grid, Hansa Teutónica… y pedía cambiarlas por las de la API. No había nada que
  cambiar: los `.webp` del repo **y los de GitHub Pages** son ya las cajas de BGG
  (comprobado byte a byte con `curl`). Lo que fallaba era la caché: el service worker
  guarda `covers/*.webp` con **`CacheFirst`** y 180 días de vida, y hasta el commit
  `12422f0` esas mismas rutas servían **fotos de Wikimedia** (`Rummikub1.jpg`,
  `Deskohraní 2012` para King of Tokyo, `Vysoké napětí` para Power Grid…), justo las
  fotos de gente jugando. Mismo nombre de fichero, contenido nuevo ⇒ el móvil no lo
  volvía a pedir. Arreglado versionando el nombre de la caché en `vite.config.ts`
  (`portadas` → `portadas-v2`) y borrando la vieja al arrancar desde
  `src/lib/caches.ts` (`dropStaleCaches`, llamada en `main.tsx`). **Hasta que esto no se
  despliegue, Toni seguirá viendo las fotos viejas**; si quiere verlo antes, vale con
  borrar los datos del sitio en el navegador.
- **Ya no queda ninguna portada fuera de la API (2026-08-19)**. `scripts/covers.overrides.ts`
  se ha quedado vacío: «Camel Up» y «Terraforming Mars» ya tenían ID de BGG, y
  «Aventureros al Tren» (9209) y «Parchís» (2136, «Pachisi») lo han recibido en
  `bgg-ids.overrides.ts`. Las 369 portadas tienen `source: 'bgg'`.
- Rama `main`. Todo en verde: `npm run lint && npm test && npm run build` pasa
  (146 tests, build OK). Comprobado 2026-08-19.
- **Tamaño de las tarjetas de juego en móvil (rejilla a 2/3/4 columnas)**. Sale de una
  consulta de Toni («¿las hago más pequeñas?, ¿pongo un selector?») que se contestó con un
  lienzo de maquetas medido; la respuesta corta es que el problema no era el tamaño sino
  que en Inicio había **tres rejillas iguales haciendo dos trabajos distintos**. Lo que hay
  ahora:
  - Las de arriba (**«Los que más jugáis»** y **«Vuestros juegos»**) son un lanzador: seis
    juegos como mucho, se tocan a diario y se reconocen por la portada. Van **siempre a dos
    columnas** y NO obedecen al mando. Que no se les cuelgue el `size` por comodidad.
  - Las de abajo (**«Del catálogo»** y los **resultados de búsqueda**) son un catálogo de
    cientos por el que se navega leyendo nombres. Ahí manda el usuario, con `GridSizePicker`
    pegado al titular de la rejilla que cambia. Por defecto **medianas (3 columnas)**: a 390
    px se pasa de 4 juegos por pantalla a 9.
  - **`src/lib/tilesize.ts`** (nuevo): `TileSize = 'large' | 'medium' | 'small'`, `TILE_SIZES`,
    `getStoredTileSize` / `setStoredTileSize` y `tileGridClass`. Guarda en `localStorage`
    bajo `mesa.tilesize`, **igual que el tema** (`theme.ts`): es preferencia de quien mira,
    no dato del grupo, así que **no pasa por `TableTrackerApi` ni toca la BD** — nada de SQL
    que ejecutar. El precio asumido: no viaja del móvil al portátil.
  - **`GameGrid.tsx`** (nuevo): la rejilla que vivía suelta dentro de `HomePage` se extrajo
    porque se pinta tres veces y cada una con su tamaño. Acepta `children` para que la
    tarjeta de «Crear juego» siga dentro de la rejilla de «Vuestros juegos».
  - **`GridSizePicker.tsx`** (nuevo): mando de tres posiciones (`.seg`/`.seg-btn`/`.seg-btn-on`),
    con iconos `rejilla-2/3/4` nuevos en `Icon.tsx` — tantas barras como columnas. Van macizos
    y no de trazo: a 18 px un contorno de 2 px sobre una barra de 3 px se cierra sobre sí
    mismo. Estado en `aria-pressed`, no `radiogroup`: son tres formas de ver lo mismo.
  - **`GameTile.tsx`** acepta `size`. Encoger **no es escalar**: el detalle se cae por pasos
    —desaparece la línea «3–6 jugadores · Puntos», el nombre pasa a partirse en dos líneas
    en vez de cortarse (con altura reservada para que las filas cuadren), la chapa «Vuestro»
    se queda en un punto de color con el texto en `sr-only`, y el filete `game-rule` baja de
    5 a 3 px (`game-rule-thin`) porque sobre una portada de 76 px se comía la carátula.
  - ⚠️ Las medidas viven **todas en `index.css`** (`.game-grid*`, `.tile*`, `.seg*`), no en
    clases de Tailwind sueltas en el marcado: en Tailwind v4 la capa `utilities` gana a
    `components` **pase lo que pase con la especificidad**, así que un `block` o un `px-2` en
    el JSX anularía en silencio la regla de la capa de componentes. Por eso `GameTile` lleva
    `tile-name` y no `tile-name block`.

- **Legibilidad y «aspecto juvenil»**. Es la mezcla que eligió Toni sobre el lienzo de
  maquetas del 2026-08-19, ya implementada y en `main`. Qué hay que saber de esto:
  - **Dos tipos, y la razón por la que son dos.** `--font-display` es **Fredoka** y
    `--font-sans` es **Nunito**, servidas desde `src/assets/fonts/*.woff2` (cuatro
    subconjuntos, variables). Están en `src/assets/` y **no** en `public/` a propósito:
    así Vite las reescribe con el `base` y siguen resolviendo bajo `/table-tracker/` en
    Pages —comprobado compilando con `BASE_PATH`—; en `public/` habría que prefijar a
    mano. Y van dentro del repo en vez de enlazadas a Google porque `workbox` ya precachea
    los `woff2` y así la letra sobrevive sin conexión.
  - ⚠️ **Ninguna cifra se escribe en Fredoka.** Se midió el binario: no trae `tnum` y sus
    dígitos miden distinto (el «1» 383 unidades y el «2» 577), así que un marcador puesto
    con ella baila al sumar. Nunito los tiene los diez a 600. Por eso `.scoreboard-total`
    fuerza `font-family: var(--font-sans)`, y si alguien añade cifras nuevas, ahí van.
  - **Fredoka llega a 700, no a 900.** `.display`, `.btn`, `.tab` y todo lo que era
    `font-weight: 900` está remapeado; `font-black` en el marcado pasó a `font-extrabold`
    (Nunito tope 800). Si vuelve a aparecer un 900, no rompe pero tampoco engorda.
  - **Utilidades nuevas en `index.css`**: `nombre` (Fredoka 600 en caja normal, para
    nombres propios: juego, jugador, grupo — es lo que evita «CARCASSONNE»), `game-band`
    (color del juego al 30 %/36 %, fondo del que va ganando) y `game-rule` (el filete de
    5 px bajo la portada de las tarjetas). El color del juego sigue sin pintarse tal cual
    en ningún sitio.
  - `--color-muted` de `#5e707a` a `#4a5c66` (el viejo no llegaba a 4,5:1 sobre
    `--color-surface-2`); en oscuro de `#8898a1` a `#93a4ad`. Nada de letra por debajo de
    12 px salvo el «✓» decorativo del avatar registrado, que vive en un disco de 14 px.
  - `Icon.tsx` **nuevo**: los emojis 🎲📋👥✨ de la barra de secciones eran los únicos
    dibujos que no seguían el color de la sección activa. Ahora son SVG de trazo 2 px en
    rejilla de 24 en `currentColor`.
  - `Logo.tsx` redondeado sin volver a trazarlo: un contorno del mismo color con
    `stroke-linejoin="round"` redondea los catorce vértices del meeple de una vez. La
    animación de entrada no se tocó. **`public/favicon.svg` y los tres PNG
    (`pwa-192`, `pwa-512`, `apple-touch-icon`) están regenerados** desde el SVG nuevo con
    `sharp`, que ya estaba en `node_modules`.
- **Repaso de interfaz (9 cambios, revisados uno a uno con Toni en el navegador)**.
  Lo gordo es la **hoja de puntuación del revés**: `ScoreSheet.tsx`
  ya no apila una ficha larga por jugador, sino un bloque por **concepto** con un control
  por jugador dentro (`FieldGroup` → `FieldBlock`), que es como se cuenta en la mesa
  («¿cuántos pueblos tenéis?» y vuelta a la mesa). Encima, un **marcador fijo**
  (`Scoreboard`, clase `.scoreboard`, pegado bajo la cabecera con `--app-header-h`) que
  ordena solo por total y respeta `winnerRule: 'lowest'`; cuando toca decidir el ganador a
  mano, sus casillas se vuelven botones. `ScoreFieldInput.tsx` pasó a
  **`ScoreFieldControl.tsx`** (`git mv`): ahora solo pinta el widget —el concepto lo nombra
  la hoja— y recibe `owner` (el nombre del jugador) para que los `aria-label` sigan siendo
  únicos: «Añadir 1 a Ciudades de Ana». El resto: contadores −/+ a 44 px con el signo en
  el color del texto (`.stepper*`); fuera la marca de agua de la portada de las tarjetas de
  desglose (borrada la utilidad `game-photo` y su variable `--game-photo-opacity`, la
  portada se queda en la banda); los chips de `PlayerPicker` reservan el hueco del número de
  orden para no crecer bajo el dedo; **una sola barra de secciones** en el marcado
  (`.tabbar`) que está fija abajo en móvil y dentro de la cabecera desde `md` —por eso la
  cabecera perdió el `backdrop-blur`, que creaba bloque contenedor y habría anclado la barra
  fija a la cabecera en vez de al viewport—; contenedores a `max-w-5xl`; rejillas de juegos
  a `lg:grid-cols-4/5`, listas de partidas y desgloses a `lg:grid-cols-2`, chuleta de reglas
  a dos columnas desde `lg`; pestañas de `GamePage` con recuadro y sombra (`.tabs`/`.tab`/
  `.tab-on` + `game-wash`) y portada del hero a 88 px; la fila de filtros de `/partidas` usa
  la utilidad nueva `scroll-x` (esconde la barra del navegador); el aviso de demostración
  cabe en una línea y toda la franja enlaza a `/grupo`.
- **Carátulas del catálogo vía BGG**: Toni consiguió token de la XML API2 de BGG
  (`BGG_API_TOKEN` en `.env`, sin `VITE_` — solo lo leen los scripts). Ejecutados
  `npm run ids` y `npm run covers` de una tacada. `external-ids.generated.ts`:
  366/393 juegos con ID de BGG (231 Wikidata + 135 búsqueda BGG); 27 sin resolver
  quedan comentados con `?` para revisar a mano en `scripts/bgg-ids.overrides.ts`.
  `covers.generated.ts` + `public/covers/*.webp`: 368/393 juegos con portada
  real (364 BGG, 1 Wikipedia, 3 manuales); 25 juegos (Go, Mindbug, KeyForge,
  Villainous, Unmatched sueltos, EXIT, etc. — ver lista en el log del script) se
  quedan con el icono por defecto, sin ficha en BGG o sin match claro. Todo en verde
  (141 tests, build OK) tras la descarga.
- **Cambiar/añadir grupo también desde «Jugadores»**: `PlayersPage.tsx` repite ahora el
  control de grupo que ya vivía solo en `GroupPage.tsx` (`/grupo`), para no obligar a saltar
  de pestaña. Debajo del `PageHeader`: chips «Cambiar de grupo» (solo si `groups.length > 1`,
  usa `setGroupId` de `GroupContext`) y siempre el link «Crear o unirme a otro grupo» hacia
  `/grupo/nuevo`. Misma lógica y contexto que `GroupPage`, sin tocar `GroupContext.tsx`; la
  sección de `GroupPage` se queda igual, es un segundo acceso por comodidad.
- **Ficha de juego única, maqueta B (pestañas)**: la página de Reglas independiente
  (`RulesIndexPage`, `RuleSheetPage`) desapareció. `GamePage.tsx` (`src/pages/GamePage.tsx`)
  ahora es la única ficha: hero fijo arriba (portada + nombre + tagline + chips de meta) con
  el botón «＋ Crear partida» siempre visible justo debajo —lleva a `/nueva/:slug` con grupo,
  a `/grupo/nuevo` con sesión sin grupo, o a `/login` sin sesión—, y debajo tres pestañas
  (`role="tablist"`, estado local `useState`) Reglas / Estadísticas / Partidas. Reglas es la
  pestaña por defecto; se puede abrir directo en cualquiera con `?tab=reglas|estadisticas|partidas`
  (`useSearchParams`), que es justo lo que usa el redirector de rutas viejas. `App.tsx` conserva
  `reglas` → `/` y `reglas/:slug` → `/juegos/:slug?tab=reglas` (componente `RuleSheetRedirect`)
  para no romper enlaces guardados ni la caché de la PWA; los ficheros de las páginas viejas se
  borraron. Toda la app enlaza ya a la ficha, no a las rutas de reglas: `HomePage.tileLink`
  siempre es `/juegos/:slug` (antes `/nueva/:slug` con grupo), `LibraryPage`, `LibraryShelf` y
  `MatchDetailPage` apuntan a `/juegos/:slug` en vez de `/reglas/:slug`. `MatchCard` ya no es un
  único `<Link>`: la portada y el nombre del juego enlazan a su ficha, y el resto de la fila
  (fecha, jugadores, resultado, `›`) a la partida — dos `<a>` en paralelo dentro de la misma
  tarjeta, nunca uno anidado en el otro. `App.test.tsx` y `GuestMode.test.tsx` actualizados al
  nuevo recorrido (tocar un juego abre su ficha; «Crear partida» es lo que lleva al marcador).
- **Chuletas de reglas en el catálogo (oleada 1)**: los juegos de `catalog.data.ts` ya
  pueden llevar `RuleSheet` sin promocionarse a `definitions/`. Viven en
  `src/games/catalog.rules.ts` (`CATALOG_RULES: Record<slug, RuleSheet>`) y `catalog.ts`
  las engancha `seed-games.ts` (antes lo hacía `catalog.ts` en `expand()`; desde la fase 1
  del escalado ya no, para no meterlas en el arranque). El slug que no está en el mapa se
  queda con «Sin chuleta de reglas». Hecha la **primera oleada: 50 juegos** (los más
  jugados). ⚠️ Aquí se dijo que «las reglas NO tocan BD» y **era falso**: `seed-games.ts`
  serializa la definición entera en `definition` jsonb, chuleta incluida. **Una chuleta
  nueva sí pide `npm run seed:games`.**
- **Portada de login con logo animado + invitado**: `<Logo>` acepta ahora
  `animated?: boolean` (por defecto `false`; la cabecera sigue quieta). Con `animated`,
  cada palabra converge —mitad izquierda desde la izquierda, derecha desde la derecha— y
  el dado cae encima con un rebote corto. Movimiento en `src/index.css` (`@keyframes
  logo-from-left/right/-die-drop` + clases `.logo-part-l/-r`, `.logo-die`), respetando
  `prefers-reduced-motion` (estado final, sin animar). `LoginPage.tsx` usa `<Logo stacked
  animated>` y añade, tras el formulario, un divisor «o» (`aria-hidden`) y un botón
  «Continuar como invitado» (`.btn .btn-ghost`) que hace `navigate('/')` (modo invitado
  ya existente, sin tocar `AuthContext`).
- **Avatares con animales (estilo Gartic Phone)**: además del `humano` de siempre hay 8
  bichos (`gato`, `perro`, `zorro`, `oso`, `panda`, `conejo`, `rana`, `pinguino`), cada uno
  con color y una de 5 expresiones. Compatible hacia atrás: lo guardado sin `k=` sigue
  siendo humano. Modelo en `lib/avatar.ts` (`AvatarKind`, `Expression`, `KINDS`,
  `EXPRESSIONS`), dibujo en `components/Avatar.tsx` (`Humano` + `Animal`/`Eyes`), edición en
  `components/AvatarEditor.tsx` (fila «Personaje»; los rasgos humanos solo salen si es
  humano, la «Expresión» solo si es animal).

## Pendiente / ideas (sin prioridad asignada)

- [ ] **Chuletas top-100 BGG, siguiente tanda**: van los puestos 1–72 con chuleta propia
      (última tanda: 64–72, ver bitácora 2026-08-27). Falta el resto del top-100 y queda
      saltado a propósito el puesto 63, *The Lord of the Rings: Fate of the Fellowship*
      (2024, cooperativo narrativo de estructura muy particular; no había confianza
      suficiente para no inventarse reglas, así que se dejó pendiente en vez de arriesgar).
      También saltado *Great Western Trail: New Zealand* (2023): sus mecánicas propias
      (ovejas/lana, barcos entre las dos islas, ficha kiwi) difieren bastante de la base y
      de la 2.ª edición, y esta sesión no tuvo acceso a búsqueda web para verificarlas —
      no había confianza suficiente para escribir su chuleta sin arriesgarse a inventar
      reglas. Pendiente para una tanda con acceso a fuentes.
- [ ] **Chuletas del catálogo, oleadas siguientes**: quedan sin chuleta el resto de las
      filas de `scripts/catalog.data.ts` (cientos: los grandes eurogames, campañas/mazmorras,
      terror, wargames, deckbuilders, familiares…). Escalar añadiendo entradas a
      `CATALOG_RULES` por tandas, mismo formato. Precisión de la caja base ante todo.
- [ ] 10 warnings de oxlint tipo `react(only-export-components)` (fast-refresh): constantes
      o funciones exportadas junto a componentes en `AuthContext`, `GamesContext`,
      `GroupContext`, `LibraryContext`, `GameCover`, `ShowMore`. Cosmético.

## Bitácora

- **2026-08-27** — Gustavo: sesión dedicada a *Great Western Trail: New Zealand*, saltada a
  propósito. Sin acceso a búsqueda web en esta sesión y sin confianza suficiente en el
  detalle de sus mecánicas propias (ovejas, barcos, ficha kiwi) frente a la base y la 2.ª
  edición, no se escribió la chuleta para no arriesgarse a inventar reglas. Sin commit;
  queda anotado en «Pendiente».
- **2026-08-27** — Gustavo: chuletas top-100 BGG, tanda de diez (puestos 64–72 más el
  rescate de un huérfano). Rescatado *Caverna: The Cave Farmers*, que se había quedado a
  medias en un intento anterior (fichero ya escrito, import y borrado de fila en
  `catalog.data.ts` sin commitear); verificado contra la plantilla y commiteado tal cual.
  Añadidos de cero: *Oathsworn: Into the Deepwood*, *Agricola*, *Blood on the Clocktower*,
  *Blood Rage*, *Obsession*, *Grand Austria Hotel*, *Lisboa*, *Endeavor: Deep Sea* y
  *The White Castle*. Diez commits, uno por juego, cada uno con `npm run lint && npm test
  && npm run build` en verde (207 tests, build OK) antes de commitear. Saltado a propósito
  el puesto 63, *The Lord of the Rings: Fate of the Fellowship* (2024, demasiado reciente y
  con una estructura narrativa de elección de camino poco documentada para reconstruirla
  con confianza); queda anotado en «Pendiente» en vez de inventarse las reglas. Quedan
  pendientes el resto de juegos del top-100 para tandas futuras — esta se para aquí a
  propósito, con margen de sobra sin gastar.
- **2026-08-20** — Toni: los dos SQL ejecutados y `resolve-game` desplegada desde el panel
  de Supabase. El crecimiento bajo demanda está vivo en producción. Ojo con lo de arriba:
  lo desplegado es el empaquetado de un fichero, no el código del repo.
- **2026-08-20** — Claude (terminal): **espejo de carátulas, paso 1**. `npm run
  covers:original` baja los originales de las 17.944 portadas a `scripts/data/`, con
  manifiesto y reanudación; lo puro en `scripts/lib/originals.ts` con 13 tests. Medidos
  los tamaños reales sobre 30 portadas (402 kB el original, 1,09 GB el par 256+512 px en
  WebP). Corrió entera: 17.904 de 17.904, cero fallos, 8,57 GB verificados. No cambia
  nada de la app: es la copia local, y dónde alojarlas se decide luego.
  De paso quedan apuntados tres fallos vistos al trazar las portadas (service worker
  ciego al catálogo, la ficha bajándose el original, y 345 webp locales sin uso).
- **2026-08-20** — Claude (terminal): **fase 5, y con ella el plan de escalado entero**.
  Crecimiento bajo demanda: Edge Function `resolve-game`, `catalog_misses` y sus dos
  funciones de Postgres, `resolveGame` en las dos APIs y el enganche en `useCatalogSearch`.
  El cliente de BGG y la traducción ficha → juego se mudan a `supabase/functions/_shared/`
  para que Node y Deno usen el mismo código. ⚠️ Queda que Toni ejecute
  `scripts/data/resolve_game.sql` y despliegue la función. 194 tests en verde.
- **2026-08-20** — Claude (terminal): **catálogo ingestado de verdad**. 52 min contra BGG y
  Supabase: 17.972 juegos en `public.games`, 17.944 con carátula. El ensayo previo destapó
  dos fallos que se arreglaron antes (categorías sin traducir en los lemas y un `--dry-run`
  que guardaba el avance), y las primeras búsquedas reales destaparon otro: ordenar por
  `similarity()` dejaba a Catan fuera de los tres primeros de «cata». ⚠️ Queda que Toni
  ejecute `scripts/data/search_catalog.sql`. 191 tests en verde.
- **2026-08-20** — Claude (terminal): fase 4 del plan de escalado (ver «Estado actual»). El
  catálogo sale del bundle —`catalog.data.ts` y `catalog.rules.ts` se mudan a `scripts/`, y
  en la app solo quedan los 24 escritos a mano— y entra `npm run ingest:bgg`, que siembra
  Postgres desde BoardGameGeek. Primera visita en 190 kB gzip. 189 tests en verde.
- **2026-08-20** — Claude (terminal): fase 3 del plan de escalado (ver «Estado actual»). La
  interfaz deja de tener el catálogo dentro: `GamesContext` resuelve por slug, el catálogo
  llega por tandas desde `search_catalog` con 250 ms de espera y 24 h de caché, y las
  búsquedas no se guardan en disco. Probado contra el Supabase de verdad, no solo en tests.
  Todo en verde (161 tests, build OK).
- **2026-08-19** — Claude (terminal): fase 2 del plan de escalado (ver «Estado actual»).
  Columnas nuevas en `public.games`, `pg_trgm` + índice GIN, `searchable()` gemela en SQL y
  la RPC `search_catalog`; `catalogGame`/`expandCatalogRow` para volver a montar un juego
  entero desde una fila de 150 B; `searchCatalog`/`getGameBySlug`/`getGamesBySlugs` en las
  **dos** implementaciones de la API, con sus claves de consulta; `save_custom_game` y el
  seed puestos al día. **Falta que Toni ejecute `schema.sql` y `seed_games.sql`** en su
  editor: aquí no hay acceso a Supabase. Ninguna pantalla cambia todavía. Todo en verde
  (161 tests, build OK).
- **2026-08-19** — Claude (terminal): fase 1 del plan de escalado del catálogo (ver «Estado
  actual»). Chuletas del catálogo fuera del arranque con `src/games/rules.ts`, portadas
  partidas entre el mapa que viaja y la procedencia que se queda en `scripts/`, y una ruta
  por trozo con `React.lazy`. Carga inicial de 262 a 205 kB gzip. De paso, destapado que
  `seed_games.sql` llevaba desde el 16 de agosto sin las 50 chuletas nuevas: regenerado.
  Todo en verde (146 tests, build OK).
- **2026-08-19** — Claude (terminal): las portadas viejas seguían viéndose en el móvil.
  No era el repo (los webp desplegados son ya los de BGG) sino la caché `CacheFirst` del
  service worker, que servía las fotos de Wikimedia anteriores a `12422f0`. Caché
  versionada a `portadas-v2` y borrado de la vieja al arrancar. De paso, fuera las tres
  últimas portadas de Wikipedia: `covers.overrides.ts` vacío y todo desde la API.
- **2026-08-19** — Claude (terminal): cribado de las 368 portadas buscando personas
  reales. Una sola incumplía («Obsession») y las cuatro portadas equivocadas que
  aparecieron eran homónimos mal resueltos: IDs corregidos en `bgg-ids.overrides.ts`,
  `npm run ids` + `npm run covers` regenerados. Todo en verde (146 tests, build OK).
- **2026-08-19** — Claude (terminal): tamaño de las tarjetas de juego en móvil. Primero un
  lienzo de maquetas para contestar a la consulta de Toni (cuatro pantallas de 390 px a
  distintas densidades, la tabla de medidas y el ajuste mockeado con sus costes); Toni pidió
  implementar la recomendación **y además** el selector. Rejillas de arriba fijas a dos
  columnas, catálogo y búsqueda con mando de 2/3/4 y por defecto 3, preferencia en
  `localStorage` (`mesa.tilesize`) sin tocar la API ni la BD. Nuevos `lib/tilesize.ts`,
  `GameGrid.tsx`, `GridSizePicker.tsx` e iconos `rejilla-2/3/4`; `GameTile` con `size` que
  pierde detalle por pasos. Todo en verde (146 tests, build OK).
- **2026-08-19** — Claude (terminal): revisión de legibilidad y «aspecto juvenil»,
  maquetada y **ya implementada**. Primero un lienzo de diez tableros (diagnóstico medido,
  antes/después de Inicio, piezas sueltas con sus medidas, la app a tres intensidades);
  Toni eligió una mezcla —chasis del nivel 1, marcador entre el 1 y el 2, tipografía del
  3— y se implementó entera en la misma sesión. Ver «Estado actual» para el detalle. Todo
  en verde (141 tests, build OK) y comprobado en el navegador sobre la compilación de
  producción.
- **2026-08-18** — Claude (terminal): repaso de interfaz a partir de una revisión visual de
  la app levantada en modo demostración (`VITE_SUPABASE_*` vacíos, puerto 5174, para no
  tocar los datos reales de Toni). Nueve cambios aceptados uno a uno, el mayor la hoja de
  puntuación invertida (bloque por concepto + marcador fijo) y el renombrado
  `ScoreFieldInput` → `ScoreFieldControl` con `owner`. `App.test.tsx` actualizado: cada
  concepto aparece una vez y los `aria-label` llevan «de ‹nombre›». Todo en verde
  (141 tests, build OK).
- **2026-08-17** — Gustavo: descargadas carátulas reales del catálogo con la BGG XML API2
  (token de Toni en `.env`). `npm run ids` → 366/393 con ID de BGG. `npm run covers` →
  368/393 (94 %) con portada real, 25 se quedan con icono (sin ficha en BGG/Wikidata o sin
  match fiable). Todo en verde (141 tests, build OK). Sin commitear — 366 `.webp` +
  `external-ids.generated.ts` + `covers.generated.ts` a la espera de que Toni confirme si
  quiere que se suba.
- **2026-08-17** — Claude (terminal): sección para cambiar/añadir grupo también en la
  pestaña «Jugadores» (`PlayersPage.tsx`), reutilizando `GroupContext` tal cual —igual que
  ya existía en `GroupPage.tsx`, ahora accesible desde ambos sitios. Todo en verde
  (141 tests, build OK).
- **2026-08-16** — Claude (terminal): ficha de juego única con pestañas (maqueta B del
  comparador, elegida por Toni). Fuera la página de Reglas independiente, con redirecciones
  desde `/reglas` y `/reglas/:slug`. Título e imagen del juego enlazan siempre a su ficha
  (`MatchCard`, `MatchDetailPage`, `LibraryPage`, `LibraryShelf`, `HomePage`). Tests
  actualizados. Todo en verde (141 tests, build OK).
- **2026-08-15** — Gustavo: primer contacto con el proyecto. Corrida la comprobación
  completa (verde). Creado este `ESTADO.md` como puente entre sesiones.
- **2026-08-15** — Gustavo: avatares con animales estilo Gartic Phone + expresiones,
  compatible hacia atrás. Todo en verde.
- **2026-08-15** — Gustavo: animación de entrada del logotipo (`Logo animated`) y botón
  «Continuar como invitado» en la portada de login. Todo en verde (141 tests, build OK).
- **2026-08-15** — Gustavo: «Código Secreto» (Codenames) asciende a juego con hoja propia
  (`definitions/codigo-secreto.ts`, slug `codenames` para conservar portada e IDs), borrada
  su fila de `catalog.data.ts` y regenerado `seed_games.sql` (393 juegos, 24 con chuleta).
  Puntuación mapeada a por-jugador: campo `agents_contacted` (0–9, 1 pt) como total —el bando
  ganador contacta a todos sus agentes y se lleva la mayor—, más `spymaster` (informativo) y
  `assassin` (−99, la derrota instantánea manda al último puesto). Todo en verde (141 tests,
  build OK).
- **2026-08-16** — Gustavo: chuletas de reglas para el catálogo (oleada 1). Nuevo
  `catalog.rules.ts` con `CATALOG_RULES` (50 juegos más jugados), enganchado en `catalog.ts`
  vía `rules: CATALOG_RULES[slug]`. Actualizados los comentarios de `catalog.ts`,
  `catalog.data.ts` y `registry.test.ts` (el catálogo ya PUEDE llevar chuleta). Sin cambios
  de BD. Todo en verde (141 tests, build OK).
