/**
 * Imágenes de un artículo de Wikipedia, pidiéndolas por título exacto.
 *
 * La diferencia con lo que hacía antes `fetch-covers.ts` es que aquí NO se busca: el
 * título llega ya resuelto desde el sitelink de Wikidata, así que no hay forma de
 * acabar en el artículo de una planta llamada «Root».
 *
 * Hay dos formas de sacar la imagen, y no dan lo mismo:
 *
 *   · `infoboxImage()` lee el wikitexto y coge el parámetro `image` de la ficha. Eso es
 *     siempre la caja del juego, subida a la Wikipedia local como uso legítimo.
 *   · `pageImages()` pregunta a la API cuál es «la» imagen del artículo, y la API tiende
 *     a devolver la que está en Commons. Commons solo admite imágenes libres, y la
 *     carátula de un juego no lo es: lo que hay allí suele ser una foto de la partida
 *     montada sobre la mesa, que como portada de una ficha no vale gran cosa.
 *
 * Por eso la ficha va primero y `pageImages()` queda como recurso.
 */
const USER_AGENT = 'MesaBoardGameTracker/1.0 (https://github.com/; contacto en el repo)'

interface Page {
  title: string
  original?: { source: string }
  imageinfo?: { url: string }[]
  revisions?: { slots?: { main?: { content?: string } } }[]
}

interface Response {
  query?: {
    normalized?: { from: string; to: string }[]
    redirects?: { from: string; to: string }[]
    pages?: Page[]
  }
}

/**
 * Una consulta a la API, reintentando cuando Wikimedia corta por ritmo.
 *
 * Devuelve `429` con `Retry-After` al que va deprisa, y respetarlo sale gratis: bajar
 * cuatrocientas fichas es cuestión de minutos y quedarse bloqueado deja el script inútil.
 */
async function query(lang: string, params: Record<string, string>): Promise<Response> {
  const search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...params })
  const url = `https://${lang}.wikipedia.org/w/api.php?${search}`

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.ok) return (await response.json()) as Response
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10)
    const waitMs = Number.isFinite(retryAfter) ? (retryAfter + 1) * 1000 : 5000 * attempt
    await new Promise((done) => setTimeout(done, waitMs))
  }
  throw new Error('la API de Wikipedia sigue limitando el ritmo tras varios reintentos')
}

/**
 * Deshace el camino que recorre MediaWiki (normalización del título y redirecciones)
 * para saber a qué título de los pedidos corresponde cada artículo devuelto.
 */
function backwardsMap(body: Response): Map<string, string> {
  const backwards = new Map<string, string>()
  for (const step of [...(body.query?.normalized ?? []), ...(body.query?.redirects ?? [])]) {
    backwards.set(step.to, backwards.get(step.from) ?? step.from)
  }
  return backwards
}

/**
 * Nombre del fichero que la ficha del artículo declara como imagen principal, o
 * `undefined`. Se aceptan las variantes del parámetro que usan las fichas en español y
 * en inglés; queda fuera a propósito todo lo que empiece por `image` y no sea el fichero
 * (`image_caption`, `image_size`, `image_alt`), que si no se cuela el pie de foto.
 */
const IMAGE_PARAM =
  /^\s*\|\s*(?:image|image_file|image_name|cover|imagen|imagen_nombre|carátula|caratula)\s*=\s*(.*)$/im
const FILE_PREFIX = /^\s*(?:file|image|archivo|imagen)\s*:\s*/i
const EXTENSION = /\.(?:jpe?g|png|gif|webp|svg)$/i

export function infoboxFile(wikitext: string): string | undefined {
  const match = wikitext.match(IMAGE_PARAM)
  if (!match) return undefined

  let value = match[1].replace(/<!--[\s\S]*?-->/g, '').trim()
  // A veces el valor viene como enlace completo: `[[File:Algo.jpg|thumb|pie de foto]]`.
  if (value.startsWith('[[')) value = value.slice(2).split(/[|\]]/)[0]
  value = value.replace(FILE_PREFIX, '').trim()

  // Lo que quede tiene que ser un nombre de fichero. Si la ficha mete una plantilla
  // (`{{Infobox …}}`) o deja el parámetro vacío, aquí se cae y el juego pasa de etapa.
  return EXTENSION.test(value) ? value : undefined
}

/** URL de descarga de cada fichero, preguntando por su nombre exacto. */
async function fileUrls(lang: string, names: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>()
  const key = (name: string) => name.replace(/_/g, ' ').toLowerCase()

  for (let start = 0; start < names.length; start += 40) {
    const batch = names.slice(start, start + 40)
    const body = await query(lang, {
      titles: batch.map((name) => `File:${name}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
    })
    for (const page of body.query?.pages ?? []) {
      const url = page.imageinfo?.[0]?.url
      if (!url?.startsWith('https://')) continue
      urls.set(key(page.title.replace(FILE_PREFIX, '')), url.split('?')[0])
    }
    if (start + 40 < names.length) await new Promise((done) => setTimeout(done, 500))
  }

  const byRequestedName = new Map<string, string>()
  for (const name of names) {
    const url = urls.get(key(name))
    if (url) byRequestedName.set(name, url)
  }
  return byRequestedName
}

/**
 * Imagen de la ficha de cada artículo pedido, que en un juego de mesa es su caja.
 * La clave del mapa es el título tal y como se pasó.
 */
export async function infoboxImages(
  lang: string,
  titles: string[],
  batchSize = 20,
): Promise<Map<string, string>> {
  const images = new Map<string, string>()
  const unique = [...new Set(titles.filter(Boolean))]

  for (let start = 0; start < unique.length; start += batchSize) {
    const batch = unique.slice(start, start + batchSize)
    const body = await query(lang, {
      titles: batch.join('|'),
      redirects: '1',
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
    })

    const backwards = backwardsMap(body)
    const wanted = new Map<string, string>()
    for (const page of body.query?.pages ?? []) {
      const file = infoboxFile(page.revisions?.[0]?.slots?.main?.content ?? '')
      if (file) wanted.set(backwards.get(page.title) ?? page.title, file)
    }

    const urls = await fileUrls(lang, [...new Set(wanted.values())])
    for (const [title, file] of wanted) {
      const url = urls.get(file)
      if (url) images.set(title, url)
    }

    if (start + batchSize < unique.length) {
      await new Promise((done) => setTimeout(done, 500))
    }
  }

  return images
}

/**
 * Imagen principal del artículo según la API (`pageimages`). `pilicense=any` incluye las
 * de uso legítimo, pero cuando el artículo tiene además una foto libre en Commons suele
 * ganar esa: por eso esta etapa va después de `infoboxImages()`, no antes.
 */
export async function pageImages(
  lang: string,
  titles: string[],
  batchSize = 20,
): Promise<Map<string, string>> {
  const images = new Map<string, string>()
  const unique = [...new Set(titles.filter(Boolean))]

  for (let start = 0; start < unique.length; start += batchSize) {
    const batch = unique.slice(start, start + batchSize)
    const body = await query(lang, {
      titles: batch.join('|'),
      redirects: '1',
      prop: 'pageimages',
      piprop: 'original',
      pilicense: 'any',
      pilimit: 'max',
    })

    const backwards = backwardsMap(body)
    for (const page of body.query?.pages ?? []) {
      const source = page.original?.source
      if (!source?.startsWith('https://')) continue
      // Wikipedia añade parámetros de seguimiento a las URLs: no hacen falta.
      images.set(backwards.get(page.title) ?? page.title, source.split('?')[0])
    }

    if (start + batchSize < unique.length) {
      await new Promise((done) => setTimeout(done, 500))
    }
  }

  return images
}
