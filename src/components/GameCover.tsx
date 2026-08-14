import { useEffect, useState, type CSSProperties } from 'react'
import type { GameDefinition } from '../games/types'

/**
 * Portada del juego: la foto de su caja.
 *
 * Las portadas del catálogo son enlaces a servidores ajenos (Wikipedia y las webs de
 * las editoriales) y las de los juegos del grupo viven en el bucket de Supabase. Nada
 * de eso está garantizado: si la imagen no carga, la pantalla no puede quedarse con un
 * hueco, así que se vuelve al icono sobre el color del tema, que es como se pintaban
 * todos los juegos antes de tener portada.
 */
export function useCover(game: GameDefinition) {
  const [failed, setFailed] = useState(false)

  // El mismo componente se reutiliza al cambiar de juego (listas, cabeceras): si no se
  // reinicia, un fallo de una portada dejaría sin imagen a la siguiente.
  useEffect(() => setFailed(false), [game.imageUrl])

  return {
    src: failed ? undefined : game.imageUrl,
    onError: () => setFailed(true),
  }
}

/** Portada cuadrada para listas y cabeceras. Sin imagen, el icono del juego. */
export function GameCover({ game, size = 40 }: { game: GameDefinition; size?: number }) {
  const cover = useCover(game)

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-[var(--color-border)] ${
        cover.src ? '' : 'game-wash'
      }`}
      style={{ width: size, height: size, '--game': game.theme.primary } as CSSProperties}
      aria-hidden="true"
    >
      {cover.src ? (
        <img
          src={cover.src}
          alt=""
          loading="lazy"
          onError={cover.onError}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="leading-none" style={{ fontSize: size * 0.55 }}>
          {game.icon}
        </span>
      )}
    </span>
  )
}
