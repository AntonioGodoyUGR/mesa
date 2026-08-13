# 🎯 Mesa — marcador de juegos de mesa

Apunta el resultado de vuestras partidas, mira el histórico de cada jugador (incluido el
cara a cara contigo) y ten las reglas a mano en la propia mesa. Web + PWA instalable + APK
de Android.

Trae **23 juegos** de catálogo —de Monopoly, Trivial o Parchís a Wingspan, Azul o Terraforming
Mars— y cada grupo puede **crear los suyos** desde la propia app, con imagen, su sistema de
puntuación y sus reglas.

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
  definitions/        Un fichero por juego — la única fuente de verdad
  registry.ts         computeTotal, rankPlayers, validateScores…
  custom.ts           Juegos del grupo: slugs c-, plantilla y validación
src/lib/            Datos y estadísticas
  api.ts              Interfaz MesaApi; elige implementación real o de demostración
  api.supabase.ts     La real
  api.demo.ts         En memoria, para probar sin backend
  stats.ts            Estadísticas y cara a cara, calculadas en el cliente
  image.ts            Reescalado de portadas a webp antes de subirlas
src/context/        Sesión, grupo activo y catálogo de juegos (integrados + del grupo)
src/components/     Piezas reutilizables, todas guiadas por GameDefinition
src/pages/          Una pantalla por ruta
supabase/           schema.sql, storage.sql y el seed generado
scripts/            Generadores (seed de juegos, iconos PNG)
```

### La idea: todo parametrizado

Un juego se describe **una sola vez**, en su fichero de `src/games/definitions/`: su icono,
sus colores, cuántos jugadores admite, **cómo se llaman los puntos en ese juego** (Puntos de
victoria, Puntos, Monedas), qué campos se apuntan, cómo se calcula el total, quién gana y su
chuleta de reglas.

De ahí sale todo:

- La **interfaz** no conoce ningún juego. `ScoreSheet` pinta los campos que declare la
  definición, con sus nombres y sus iconos.
- La **base de datos** tampoco: las puntuaciones viven en una columna `jsonb` con las claves
  de `ScoreField.key`, y las tablas `games` / `game_score_fields` se siembran desde el mismo
  TypeScript con `npm run seed:games`. Postgres recalcula los totales con esa misma
  configuración (`compute_match_total`), así que la regla de puntuación no está duplicada.

**Añadir un juego al catálogo** = crear su fichero, añadirlo a `BUILTIN_GAMES` y ejecutar
`npm run seed:games`. Ni una migración ni un componente tocado.

### Juegos propios

La misma idea, pero desde la app: **＋ Crear juego** en la portada (o en la pantalla del
grupo) abre un formulario con el juego entero —emoji, portada, colores, jugadores, campos de
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

### Jugadores sin cuenta

Los `players` de un grupo son independientes de las cuentas: un invitado tiene su ficha, su
histórico y sus estadísticas sin registrarse. Cada partida necesita **al menos un jugador con
cuenta** (lo valida el RPC `save_match`, no solo la interfaz) y no hay máximo. Si más adelante
un invitado se registra y entra al grupo con el código, `join_group` enlaza su ficha con la
cuenta y conserva todo el histórico.

### Sin conexión

La caché de TanStack Query se persiste en `localStorage`, así que las reglas y las partidas ya
vistas se consultan sin cobertura. Guardar una partida sí requiere conexión.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprobación de tipos + build de producción |
| `npm run preview` | Sirve el build (para probar la PWA de verdad) |
| `npm test` | Tests del motor de juegos |
| `npm run lint` | oxlint |
| `npm run seed:games` | Regenera `supabase/seed_games.sql` desde las definiciones |
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
