# 🎯 Mesa — marcador de juegos de mesa

Apunta el resultado de vuestras partidas, mira el histórico de cada jugador (incluido el
cara a cara contigo), lleva tu biblioteca de juegos (lo que tienes y lo que quieres) y ten
las reglas a mano en la propia mesa. Web + PWA instalable + APK de Android.

Trae **casi 400 juegos** de catálogo: 23 con hoja de puntuación propia y chuleta de reglas
—de Monopoly, Trivial o Parchís a Wingspan, Azul o Terraforming Mars— y el resto del top de
BoardGameGeek listo para apuntar quién ganó y con cuántos puntos. Y cada grupo puede **crear
los suyos** desde la propia app, con imagen, su sistema de puntuación y sus reglas.

## Puesta en marcha

```bash
npm install
npm run dev
```

Sin configurar nada arranca en **modo demostración**: datos de mentira en `localStorage`,
suficiente para recorrer la app entera.

### Conectar Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com) (no reutilices uno
   existente: el esquema crea sus propias tablas y triggers sobre `auth.users`).
2. En el **SQL Editor**, ejecuta en este orden:
   - `supabase/schema.sql` — tablas, RLS, funciones y RPCs.
   - `supabase/seed_games.sql` — el catálogo de juegos, generado desde el código.
   - `supabase/storage.sql` — el bucket `game-images`, donde van las portadas de los juegos
     que cree la gente. Sin él todo funciona menos subir imágenes.
3. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API).
4. Reinicia `npm run dev`. El aviso de «modo demostración» desaparece.

## Cómo está montado

```
src/games/          El motor: la definición de cada juego y los cálculos
  types.ts            GameDefinition, ScoreField, RuleSheet
  definitions/        Un fichero por juego escrito a mano — la fuente de verdad
  curated.ts          La lista de esos juegos
  catalog.data.ts     El catálogo amplio: un juego por línea
  catalog.ts          Convierte esas líneas en GameDefinition completas
  covers.generated.ts Portadas del catálogo (npm run covers) — no se edita a mano
  registry.ts         Junta las dos capas + computeTotal, rankPlayers, validateScores…
  custom.ts           Juegos del grupo: slugs c-, plantilla y validación
src/lib/            Datos y estadísticas
  api.ts              Interfaz MesaApi; elige implementación real o de demostración
  api.supabase.ts     La real
  api.demo.ts         En memoria, para probar sin backend
  stats.ts            Estadísticas y cara a cara, calculadas en el cliente
  library.ts          Biblioteca personal: comprados y deseados
  image.ts            Reescalado de portadas a webp antes de subirlas
src/context/        Sesión, grupo activo, catálogo de juegos y biblioteca personal
src/components/     Piezas reutilizables, todas guiadas por GameDefinition
src/pages/          Una pantalla por ruta
supabase/           schema.sql, storage.sql y el seed generado
scripts/            Generadores (seed de juegos, iconos PNG)
```

### La idea: todo parametrizado

Un juego se describe **una sola vez**, en su fichero de `src/games/definitions/`: su icono,
su color, cuántos jugadores admite, **cómo se llaman los puntos en ese juego** (Puntos de
victoria, Puntos, Monedas), qué campos se apuntan, cómo se calcula el total, quién gana y su
chuleta de reglas.

De ahí sale todo:

- La **interfaz** no conoce ningún juego. `ScoreSheet` pinta los campos que declare la
  definición, con sus nombres y sus iconos.
- La **base de datos** tampoco: las puntuaciones viven en una columna `jsonb` con las claves
  de `ScoreField.key`, y las tablas `games` / `game_score_fields` se siembran desde el mismo
  TypeScript con `npm run seed:games`. Postgres recalcula los totales con esa misma
  configuración (`compute_match_total`), así que la regla de puntuación no está duplicada.

**Añadir un juego al catálogo** = crear su fichero, añadirlo a `CURATED_GAMES` y ejecutar
`npm run seed:games`. Ni una migración ni un componente tocado.

### Las dos capas del catálogo

Escribir a mano la hoja de puntuación y la chuleta de un juego cuesta un rato bien empleado
en los que se juegan de verdad, pero no escala a cientos de títulos. Así que hay dos capas:

- **Escritos a mano** (`definitions/`): campos con los conceptos del juego —pueblos, ciudades,
  camino más largo— y chuleta de reglas para consultar en la mesa.
- **Catálogo amplio** (`catalog.data.ts`): una línea por juego —nombre, icono, lema, jugadores,
  duración, dificultad y cuál de las cinco hojas genéricas usa (puntos, quien menos suma,
  cooperativo, por equipos o solo ganador)—. Sin chuleta: la pantalla de reglas dice «Sin
  chuleta de reglas» en vez de inventarse un resumen.

Un juego del catálogo se comporta igual que uno escrito a mano en todo lo demás: buscador,
biblioteca, partidas y estadísticas. **Ascenderlo** es escribir su fichero en `definitions/`
y borrar su fila del catálogo; si estuviera en los dos sitios, manda el escrito a mano.

Las portadas del catálogo las busca `npm run covers` en Wikipedia y las deja en
`covers.generated.ts`. El juego que no tiene portada fiable se queda con su emoji: vale más
un icono que la caja de otro juego (la API de BoardGameGeek dejó de ser pública y responde
`401` sin credenciales; RAWG, IGDB, GiantBomb, MobyGames y TheGamesDB son de videojuegos).

### Juegos propios

La misma idea, pero desde la app: **＋ Crear juego** en la portada (o en la pantalla del
grupo) abre un formulario con el juego entero —emoji, portada, color, jugadores, campos de
puntuación y reglas opcionales— y una **vista previa en vivo** que es el marcador de verdad,
no una maqueta. Se guarda como un `GameDefinition` más, así que a partir de ahí se comporta
igual que Catán: partidas, historial, estadísticas y chuleta.

- Los juegos creados **solo los ve el grupo que los creó** (`games.group_id` + RLS), y
  `save_match` rechaza usar el juego de otro grupo.
- Su slug lleva siempre el prefijo **`c-`** (`c-mi-juego-a4f2`). Es un espacio reservado: la
  base de datos comprueba que un juego con `group_id` tenga ese prefijo y que uno del catálogo
  no lo tenga, así que ningún juego integrado futuro puede pisar el de alguien.
- La **portada** se reescala a 512 px webp en el navegador (`src/lib/image.ts`) y se sube al
  bucket `game-images`, bajo la carpeta del grupo. En modo demostración se guarda como data
  URL, así que el creador se puede probar entero sin backend.
- Al editar un juego que **ya tiene partidas apuntadas**, las claves internas de sus campos
  quedan bloqueadas: son las claves del `jsonb` de esas partidas. La etiqueta, el emoji o los
  puntos sí se pueden cambiar.

### Biblioteca personal

En **tu cuenta → Tu biblioteca** (`/biblioteca`) se marca cada juego como **📦 en casa** o
**⭐ en la lista de deseos**, tanto los del catálogo como los que haya creado tu grupo. Los
mismos dos botones aparecen en cada chuleta de reglas, que es donde suele apetecer apuntar
un juego que no tienes.

- Cuelga de la **cuenta, no del grupo** (`game_library`, con clave `user_id + game_slug`): la
  caja está en tu estantería juegues con quien juegues, así que la lista te acompaña al
  cambiar de grupo.
- Es **privada**: la RLS recorta las cuatro operaciones a `user_id = auth.uid()`, ni siquiera
  tus compañeros de grupo ven lo que tienes.
- Un juego solo puede estar en un estado —lo comprado deja de estar deseado— y volver a pulsar
  el botón que ya estaba marcado lo saca de la biblioteca.

### Jugadores sin cuenta

Los `players` de un grupo son independientes de las cuentas: un invitado tiene su ficha, su
histórico y sus estadísticas sin registrarse. Cada partida necesita **al menos un jugador con
cuenta** (lo valida el RPC `save_match`, no solo la interfaz) y no hay máximo. Si más adelante
un invitado se registra y entra al grupo con el código, `join_group` enlaza su ficha con la
cuenta y conserva todo el histórico.

### Sin conexión

La caché de TanStack Query se persiste en `localStorage`, así que las reglas y las partidas ya
vistas se consultan sin cobertura. Guardar una partida sí requiere conexión.

### El estilo

Todo el aspecto vive en `src/index.css` y se resume en tres reglas: contorno de 2 px del color
del texto, **sombra sólida desplazada** en vez de desenfoque, y titulares en negra y mayúsculas
(`display`). El resto son piezas reutilizables —`.card`, `.btn`, `.input`, `.chip`, `.note`—;
en los componentes casi no hay color escrito a mano.

El color de cada juego es **uno solo** (`GameTheme.primary`) y nunca se pinta tal cual: se pasa
en línea como `--game` y lo consumen las utilidades `game-wash`, `game-tint`, `game-ink` y
`game-edge`, que lo mezclan con el fondo del modo activo. Por eso el mismo tono funciona sobre
el papel cian y sobre el fondo casi negro, sin necesidad de una paleta por tema. Los 16 colores
del catálogo (`src/games/catalog.ts`) están comprobados a 4.5:1 en los tres usos: como texto
sobre claro, con texto blanco encima y aclarados sobre oscuro.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprobación de tipos + build de producción |
| `npm run preview` | Sirve el build (para probar la PWA de verdad) |
| `npm test` | Tests del motor de juegos |
| `npm run lint` | oxlint |
| `npm run seed:games` | Regenera `supabase/seed_games.sql` desde las definiciones |
| `npm run ids` | Resuelve `slug → id de BGG / Wikidata` en `scripts/external-ids.generated.ts` |
| `npm run covers` | Descarga las portadas a `public/covers/` (`-- --dry-run`, `-- --force`) |
| `npm run icons` | Regenera los iconos PNG de la PWA |

## Android

Pendiente de instalar **JDK 21** y **Android Studio** en esta máquina. Después:

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init Mesa app.mesa.marcador --web-dir=dist
npm run build && npx cap add android && npx cap sync android
npx cap open android
```

## Reglas

Las chuletas son **resúmenes propios**, escritos para consultarse de un vistazo en la mesa. No
se incluyen ni se distribuyen los reglamentos oficiales, que tienen copyright; como mucho se
enlaza la página del editor.

## Portadas

Las imágenes de `public/covers/` son **propiedad de sus editoriales**. Se guardan recortadas a
512 px y se usan únicamente para identificar cada juego dentro de una aplicación sin ánimo de
lucro. La procedencia de cada una —fuente y URL original— queda anotada en
`src/games/covers.generated.ts`, que genera `npm run covers`. Si eres el titular de alguna y
prefieres que no aparezca, abre una incidencia y se retira.
