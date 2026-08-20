import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import App from './App'

/**
 * Prueba de humo sobre la app entera en modo demostración: comprueba que los
 * recorridos principales montan y navegan sin romperse.
 */
function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

/**
 * La rejilla de juegos y las últimas partidas nombran los mismos juegos, así que
 * hay que decir en cuál de las dos se busca.
 */
async function gameGrid() {
  const heading = await screen.findByRole('heading', { name: /Nueva partida|Juegos/ })
  return within(heading.closest('section')!)
}

describe('App', () => {
  it('la pantalla principal ofrece los juegos y las últimas partidas', async () => {
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Nueva partida' })).toBeVisible()
    const games = await gameGrid()
    expect(await games.findByText('Catán')).toBeVisible()
    expect(games.getByText('Carcassonne')).toBeVisible()
    expect(games.getByText('Camel Up')).toBeVisible()

    // Las partidas sembradas por la demo aparecen en «Últimas partidas».
    await waitFor(() => expect(screen.getAllByText(/Ana/).length).toBeGreaterThan(0))
  })

  it('el buscador deja pedir una partida corta para tres', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Inicio/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Filtros/ }))

    fireEvent.click(screen.getByRole('button', { name: /Rápida/ }))
    const players = screen.getByRole('group', { name: 'Cuántos vais a jugar' })
    fireEvent.click(within(players).getByRole('button', { name: '3' }))

    // Camel Up dura 20–30 min y admite de 3 a 8; Terraforming Mars es de otra tarde.
    // El catálogo llega del servidor, así que se espera a la rejilla filtrada antes
    // de comprobar quién no está en ella.
    const games = await gameGrid()
    expect(await games.findByText('Camel Up')).toBeVisible()
    expect(games.queryByText('Terraforming Mars')).toBeNull()
    expect(games.queryByText('Patchwork')).toBeNull() // corto, pero solo para dos

    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(await screen.findByText('Terraforming Mars')).toBeVisible()
  })

  it('permite elegir jugadores y puntuar una partida de Catán', async () => {
    renderApp()

    // Tocar el juego abre su ficha; «Crear partida» es lo que lleva al marcador.
    fireEvent.click(await (await gameGrid()).findByText('Catán'))
    fireEvent.click(await screen.findByRole('link', { name: /Crear partida/ }))

    // Paso 1: los jugadores del grupo.
    const button = await screen.findByRole('button', { name: 'Apuntar puntuaciones' })
    expect(button).toBeDisabled() // Catán necesita 3 jugadores

    for (const name of ['Tú', 'Ana', 'Beto']) {
      fireEvent.click(screen.getByRole('button', { pressed: false, name: new RegExp(name) }))
    }
    expect(button).toBeEnabled()
    fireEvent.click(button)

    // Paso 2: la hoja nombra cada concepto una vez y da un control a cada jugador.
    expect(screen.getAllByText('Pueblos')).toHaveLength(1)
    expect(screen.getAllByText('Ciudades')).toHaveLength(1)

    // Dos ciudades de Tú = 4 puntos de victoria.
    const addCity = screen.getByLabelText('Añadir 1 a Ciudades de Tú')
    fireEvent.click(addCity)
    fireEvent.click(addCity)

    await waitFor(() => expect(screen.getAllByText('4').length).toBeGreaterThan(0))
    expect(screen.getByRole('button', { name: 'Guardar partida' })).toBeEnabled()
  })

  it('un grupo puede crear su propio juego y jugarlo', async () => {
    renderApp()

    // La URL sobrevive entre pruebas (jsdom comparte `window.location`).
    fireEvent.click(await screen.findByRole('link', { name: /Inicio/ }))
    fireEvent.click(await screen.findByText('Crear juego'))

    const name = await screen.findByPlaceholderText('El juego de los jueves')
    const create = screen.getByRole('button', { name: 'Crear juego' })

    // Sin nombre no se puede guardar: lo dice validateDefinition.
    expect(create).toBeDisabled()
    fireEvent.change(name, { target: { value: 'Chinchón' } })
    expect(create).toBeEnabled()

    fireEvent.click(create)

    // Vuelve a la portada y el juego nuevo ya está entre los del grupo. Se busca
    // en la rejilla, se abre su ficha y desde ahí se crea la partida.
    fireEvent.click(await (await gameGrid()).findByText('Chinchón'))
    fireEvent.click(await screen.findByRole('link', { name: /Crear partida/ }))

    expect(await screen.findByRole('button', { name: 'Apuntar puntuaciones' })).toBeVisible()
  })

  it('la biblioteca separa lo comprado de lo deseado y se puede marcar un juego', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Inicio/ }))
    fireEvent.click(await screen.findByRole('link', { name: 'Tu grupo y tu cuenta' }))
    fireEvent.click(await screen.findByText(/en la lista de deseos/))

    // La demo trae Catán comprado y Wingspan deseado.
    const owned = await screen.findByRole('button', { pressed: true, name: 'En casa (1)' })
    expect(owned).toBeVisible()
    expect(screen.getByText('Catán')).toBeVisible()
    expect(screen.queryByText('Wingspan')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Deseados (1)' }))
    expect(await screen.findByText('Wingspan')).toBeVisible()
    expect(screen.queryByText('Catán')).toBeNull()

    // Desde «Todos» se marca cualquier juego del catálogo.
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    fireEvent.click(await screen.findByRole('button', { name: 'La tengo: Azul' }))

    fireEvent.click(await screen.findByRole('button', { name: 'En casa (2)' }))
    expect(await screen.findByText('Azul')).toBeVisible()
    expect(screen.getByText('Catán')).toBeVisible()
  })

  it('tu ficha enseña tu biblioteca, y la de otro jugador no', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: 'Tu ficha y tu avatar' }))

    // Cada página llega en su propio trozo de JavaScript (`React.lazy` en `App.tsx`), y
    // mientras llega, React deja a la vista la pantalla anterior. Si esa era /biblioteca,
    // su título también es «Tu biblioteca»: hay que esperar a algo que solo esté aquí.
    await screen.findByRole('heading', { name: 'Sus partidas' })

    // La demo trae Catán comprado y Wingspan deseado, cada uno en su estante.
    const shelf = within(
      screen.getByRole('heading', { name: 'Tu biblioteca' }).closest('section')!,
    )
    expect(shelf.getByText('Catán')).toBeVisible()
    expect(shelf.getByText('Wingspan')).toBeVisible()

    // Es privada: en el perfil de otro no aparece.
    fireEvent.click(screen.getByRole('link', { name: /Jugadores/ }))
    fireEvent.click(await screen.findByText('Ana'))

    expect(await screen.findByRole('heading', { name: 'Sus partidas' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Tu biblioteca' })).toBeNull()
  })

  it('la ficha de un juego enseña sus reglas de entrada, sin pestaña propia en la barra', async () => {
    renderApp()

    // La página de Reglas independiente desapareció: ya no hay pestaña «Reglas»
    // en la barra inferior, se entra por la ficha de cada juego.
    expect(screen.queryByRole('link', { name: /Reglas/ })).toBeNull()

    fireEvent.click(await screen.findByRole('link', { name: /Inicio/ }))
    fireEvent.click(await (await gameGrid()).findByText('Carcassonne'))

    // «Reglas» es la pestaña por defecto de la ficha.
    expect(await screen.findByText('Preparación')).toBeVisible()
    expect(screen.getByText('Puntuación')).toBeVisible()
  })

  it('la ficha de un juego reúne tus estadísticas y las de toda la app', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Inicio/ }))
    fireEvent.click(await (await gameGrid()).findByText('Carcassonne'))
    fireEvent.click(await screen.findByRole('tab', { name: 'Estadísticas' }))

    expect(await screen.findByRole('heading', { name: 'Tus partidas' })).toBeVisible()

    // La demo trae una partida de Carcassonne, que perdió «Tú» por 74 a 91.
    const global = (await screen.findByRole('heading', { name: 'En toda la app' }))
      .parentElement!
    expect(await within(global).findByText('Grupos')).toBeVisible()
    expect(within(global).getByText('91')).toBeVisible()

    // Y se puede volver a las reglas sin salir de la ficha.
    fireEvent.click(screen.getByRole('tab', { name: 'Reglas' }))
    expect(await screen.findByText('Preparación')).toBeVisible()
  })
})
