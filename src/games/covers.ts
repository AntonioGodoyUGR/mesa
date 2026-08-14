/**
 * La portada de un juego integrado, lista para poner en un `<img src>`.
 *
 * Las imágenes viven en `public/covers/` y `covers.generated.ts` guarda su ruta relativa
 * («covers/azul.webp»), no absoluta, porque la app se publica en dos sitios con base
 * distinta: en la raíz (Vercel y el servidor de desarrollo) y en `/table-tracker/` (GitHub Pages,
 * ver `BASE_PATH` en `vite.config.ts`). El prefijo correcto lo sabe Vite en
 * `import.meta.env.BASE_URL`, y es esta función la que lo pone.
 *
 * Por eso no hay que leer `COVERS` directamente: una ruta sin prefijo funciona en local
 * y da 404 en GitHub Pages, que es la clase de fallo que no se ve hasta que se despliega.
 */
import { COVERS } from './covers.generated'

export { COVERS } from './covers.generated'
export type { Cover } from './covers.generated'

/**
 * BASE_URL siempre acaba en barra ('/' o '/table-tracker/'), y el fichero nunca empieza por una.
 * Fuera de Vite —`scripts/seed-games.ts` importa el registro desde Node— no hay
 * `import.meta.env`, y ahí la base da igual: lo que se genere no se sirve a nadie.
 */
const base = import.meta.env?.BASE_URL ?? '/'

/** URL de la portada del juego, o `undefined` si no tiene (se pinta su icono). */
export function coverUrl(slug: string): string | undefined {
  const cover = COVERS[slug]
  return cover ? `${base}${cover.file}` : undefined
}
