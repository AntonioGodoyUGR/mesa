# Table Tracker — instrucciones de trabajo

Marcador de juegos de mesa: React 19 + TypeScript + Vite + Tailwind v4, datos en Supabase,
PWA. El `README.md` explica **qué** es la app y **por qué** está montada así; este fichero
recoge las reglas de trabajo. Ante la duda, manda el README.

## Antes de nada: lee `ESTADO.md`

`ESTADO.md` es el puente de contexto entre sesiones (Gustavo en OpenClaw y Claude en el
terminal trabajan sobre el mismo repo pero con conversaciones separadas). **Léelo al
empezar cualquier tarea** y **actualízalo al terminar o al dejar algo a medias**: qué está
hecho, qué quedó pendiente y por qué. El código se comparte por git; el contexto de la
charla, no — por eso se escribe ahí.

## Comprobar antes de dar nada por bueno

```bash
npm run lint && npm test && npm run build
```

`lint` es **oxlint**, no ESLint. `build` incluye la comprobación de tipos (`tsc -b`). Los
tests corren siempre en modo demostración: `vitest.config.ts` fuerza `VITE_SUPABASE_*` a
vacío a propósito, así que no hacen falta credenciales.

Un push a `main` despliega a GitHub Pages sin más pasos
(`.github/workflows/deploy.yml`). No se publica nada en rojo.

## Las cuatro reglas que no se saltan

1. **La interfaz no conoce ningún juego.** Un juego se describe una sola vez, en su
   `GameDefinition`, y los componentes (`ScoreSheet`, `GameTile`, `RuleSheetView`) pintan
   lo que esa definición declare. Si te encuentras escribiendo `if (slug === 'catan')` en
   un componente, la solución está en la definición o en `src/games/types.ts`.

2. **Todo dato pasa por `TableTrackerApi`** (`src/lib/api.ts`). Hay dos implementaciones y ambas
   son obligatorias: `api.supabase.ts` (real) y `api.demo.ts` (en memoria, persistida en
   `localStorage`). **Un método nuevo en la interfaz se implementa en las dos**, o el modo
   demostración —que es lo que usan los tests y la primera visita de cualquiera— se rompe.
   Las claves de consulta de TanStack Query viven todas en `queryKeys`, mismo fichero.

3. **Los cálculos van en módulos puros**, no en componentes: `src/games/registry.ts`
   (`computeTotal`, `computeBreakdown`, `rankPlayers`, `validateScores`, `searchGames`) y
   `src/lib/stats.ts`. Ahí se testean sin renderizar nada. Ojo: la regla de puntuación está
   **también** en Postgres (`compute_match_total` en `supabase/schema.sql`); si cambia el
   cálculo, cambian los dos sitios.

4. **El aspecto vive en `src/index.css`**, un único fichero. Se reutilizan las piezas ya
   hechas —`.card`, `.btn`, `.btn-primary`, `.btn-ghost`, `.input`, `.label`, `.chip`,
   `.note`— y las utilidades `hard`, `display`, `overline`, `tnum`. Estética arcade: borde
   de 2 px del color del texto, sombra sólida desplazada (nunca `blur`), titulares en negra
   y mayúsculas. El color de un juego entra inline como `--game` y solo se consume vía
   `game-wash` / `game-tint` / `game-ink` / `game-edge`: nunca se pinta el tono tal cual, y
   así funciona igual en claro y en oscuro.

## Tareas frecuentes

- **Añadir un juego con hoja propia**: fichero nuevo en `src/games/definitions/<slug>.ts`,
  importarlo y añadirlo a `CURATED_GAMES` (`src/games/curated.ts`), borrar su fila de
  `scripts/catalog.data.ts` si la tenía, y `npm run seed:games`.
- **Añadir un juego al catálogo amplio**: una línea en `scripts/catalog.data.ts`, y
  `npm run seed:games`. Ese fichero es la **semilla**, no un dato de ejecución: el
  catálogo se busca en Postgres, no en el bundle. El catálogo de verdad —decenas de
  miles— lo escribe `npm run ingest:bgg`, que habla con BoardGameGeek y con Supabase.
- **Ruta nueva**: registrarla en `src/App.tsx` bajo el guardián que corresponda
  (`RequireAuth`, `RequireGroup`), con la URL en español como las demás, y traer la página
  con `lazy()` como las otras: cada pantalla viaja en su propio trozo de JavaScript.
- **Ficheros generados, no se editan a mano**: `src/games/covers.generated.ts`,
  `scripts/covers.sources.generated.ts`,
  `scripts/external-ids.generated.ts`, `supabase/seed_games.sql`.

## Base de datos

No hay acceso al proyecto de Supabase desde aquí. Los cambios de esquema se escriben en
`supabase/schema.sql` (o el seed correspondiente) y **se avisa al usuario con el SQL exacto
a ejecutar** en su SQL Editor. Mientras tanto la funcionalidad se puede implementar,
testear y desplegar igual: en modo demostración funciona.

## Estilo

- **Español** en la interfaz, los comentarios, los mensajes de error y los commits, con
  comillas latinas «…». **Inglés** en los identificadores (`computeTotal`, `libraryGames`).
  Los campos que vienen de Postgres conservan su `snake_case` (`game_slug`, `display_name`).
- Sin punto y coma final, comillas simples, `export function` nombradas (nada de `export
  default` salvo `App`).
- `PascalCase.tsx` para componentes y páginas; minúscula para los módulos de `lib/` y
  `games/`; `kebab-case.ts` para las definiciones de juego, exportando un objeto en
  camelCase (`sevenWondersDuel`).
- Cada módulo abre con un comentario de bloque que explica **por qué** existe y dónde está
  su frontera, no qué hace línea a línea. Se mantiene ese tono.
- Accesibilidad: `aria-label` en los controles sin texto, `aria-hidden` en los emojis
  decorativos, `role="alert"` en los avisos.
