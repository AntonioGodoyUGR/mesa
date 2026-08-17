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
  (141 tests, build OK). Comprobado 2026-08-17.
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
