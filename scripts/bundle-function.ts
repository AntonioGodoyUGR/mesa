/**
 * La función `resolve-game`, en un solo fichero que se pueda pegar en Supabase.
 *
 * El camino normal para desplegarla es la CLI (`supabase functions deploy`), que sube
 * la carpeta entera y resuelve los `import` sola. Pero la CLI pide instalar cosas, y
 * desde el panel de Supabase —Edge Functions → «Deploy a new function» → «Via Editor»—
 * se puede desplegar sin instalar nada. Ese editor tiene una pega: es de **un solo
 * fichero**, y la función vive repartida en tres (ella, el cliente de BGG y la
 * traducción ficha → juego, que además importa el motor de la app).
 *
 * Esto junta los tres en uno. No es una copia a mano —eso sería una segunda versión
 * del código, condenada a separarse de la primera— sino un empaquetado que se rehace
 * con `npm run bundle:function` cada vez que se toque el original.
 *
 * El resultado va a `scripts/data/`, que está en `.gitignore`: es un artefacto, no
 * código fuente. Lo que se versiona es `supabase/functions/resolve-game/index.ts`.
 */
import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const ENTRY = 'supabase/functions/resolve-game/index.ts'
const OUT = 'scripts/data/resolve-game.bundle.ts'

const HEADER = `// =============================================================================
// resolve-game — GENERADO, no editar aquí
//
// Salida de \`npm run bundle:function\`. El original, con sus comentarios y repartido
// en los módulos que comparte con la ingesta, está en:
//
//     supabase/functions/resolve-game/index.ts
//     supabase/functions/_shared/bgg-api.ts
//     supabase/functions/_shared/bgg-games.ts
//
// Esto existe solo porque el editor del panel de Supabase es de un fichero. Para
// desplegarlo: Edge Functions → «Deploy a new function» → «Via Editor», nombre
// \`resolve-game\`, pegar esto entero y desplegar. Antes hay que dejar puesto el
// secreto \`BGG_API_TOKEN\` (Edge Functions → Secrets); \`SUPABASE_URL\` y
// \`SUPABASE_SERVICE_ROLE_KEY\` los pone Supabase sola.
//
// Si se cambia el original, hay que volver a generar esto y volver a pegarlo: el
// panel no se entera de lo que pase en el repositorio.
// =============================================================================

`

await mkdir('scripts/data', { recursive: true })

await build({
  entryPoints: [ENTRY],
  bundle: true,
  format: 'esm',
  // `neutral` es la clave: ni Node ni navegador. Lo que quede sin resolver son los
  // globales de Deno (`Deno.serve`, `Deno.env`), que es exactamente lo que se quiere.
  platform: 'neutral',
  target: 'es2022',
  legalComments: 'none',
  outfile: OUT,
})

const bundled = await readFile(OUT, 'utf8')
await writeFile(OUT, HEADER + bundled, 'utf8')

const lines = bundled.split('\n').length
console.log(`${OUT}: ${lines} líneas, ${(bundled.length / 1024).toFixed(1)} kB`)
console.log('Pegar en: Edge Functions → Deploy a new function → Via Editor')
