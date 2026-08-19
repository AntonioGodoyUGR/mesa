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
  las engancha en `expand()` con `rules: CATALOG_RULES[slug]`; el slug que no está en el
  mapa se queda con «Sin chuleta de reglas». Hecha la **primera oleada: 50 juegos** (los
  más jugados). Las reglas NO tocan BD: `seed-games.ts` solo cuenta chuletas para un log,
  no las persiste, así que no hace falta `npm run seed:games`.
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

- [ ] **Chuletas del catálogo, oleadas siguientes**: quedan sin chuleta el resto de las
      filas de `catalog.data.ts` (cientos: los grandes eurogames, campañas/mazmorras,
      terror, wargames, deckbuilders, familiares…). Escalar añadiendo entradas a
      `CATALOG_RULES` por tandas, mismo formato. Precisión de la caja base ante todo.
- [ ] Bundle JS en un solo chunk de ~759 kB (216 gzip). Se podría code-splitear con
      `import()` dinámico. No urge.
- [ ] 6 warnings de oxlint tipo `react(only-export-components)` (fast-refresh): constantes
      o funciones exportadas junto a componentes en `AuthContext`, `GamesContext`,
      `GroupContext`, `LibraryContext`, `GameCover`, `ShowMore`. Cosmético.

## Bitácora

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
