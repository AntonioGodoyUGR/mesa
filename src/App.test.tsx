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

describe('App', () => {
  it('la pantalla principal ofrece los juegos y las últimas partidas', async () => {
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Nueva partida' })).toBeVisible()
    expect(screen.getByText('Catán')).toBeVisible()
    expect(screen.getByText('Carcassonne')).toBeVisible()
    expect(screen.getByText('Camel Up')).toBeVisible()

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
    expect(await screen.findByText('Camel Up')).toBeVisible()
    expect(screen.queryByText('Terraforming Mars')).toBeNull()
    expect(screen.queryByText('Patchwork')).toBeNull() // corto, pero solo para dos

    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(await screen.findByText('Terraforming Mars')).toBeVisible()
  })

  it('permite elegir jugadores y puntuar una partida de Catán', async () => {
    renderApp()

    fireEvent.click(await screen.findByText('Catán'))

    // Paso 1: los jugadores del grupo.
    const button = await screen.findByRole('button', { name: 'Apuntar puntuaciones' })
    expect(button).toBeDisabled() // Catán necesita 3 jugadores

    for (const name of ['Tú', 'Ana', 'Beto']) {
      fireEvent.click(screen.getByRole('button', { pressed: false, name: new RegExp(name) }))
    }
    expect(button).toBeEnabled()
    fireEvent.click(button)

    // Paso 2: los campos con su nombre real en el juego.
    expect(screen.getAllByText('Pueblos')).toHaveLength(3)
    expect(screen.getAllByText('Ciudades')).toHaveLength(3)

    // Dos ciudades del primer jugador = 4 puntos de victoria.
    const addCity = screen.getAllByLabelText('Añadir 1 a Ciudades')[0]
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

    // Vuelve a la portada y el juego nuevo ya está entre los del grupo.
    const tile = await screen.findByText('Chinchón')
    fireEvent.click(tile)

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

  it('las chuletas de reglas son accesibles desde la barra inferior', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Reglas/ }))
    fireEvent.click(await screen.findByText('Carcassonne'))

    expect(await screen.findByText('Preparación')).toBeVisible()
    expect(screen.getByText('Puntuación')).toBeVisible()
  })

  it('la ficha de un juego reúne tus estadísticas y las de toda la app', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Reglas/ }))
    fireEvent.click(await screen.findByText('Carcassonne'))
    fireEvent.click(await screen.findByRole('link', { name: /Estadísticas de Carcassonne/ }))

    expect(await screen.findByRole('heading', { name: 'Tus partidas' })).toBeVisible()

    // La demo trae una partida de Carcassonne, que perdió «Tú» por 74 a 91.
    const global = (await screen.findByRole('heading', { name: 'En toda la app' }))
      .parentElement!
    expect(await within(global).findByText('Grupos')).toBeVisible()
    expect(within(global).getByText('91')).toBeVisible()

    // Y desde la ficha se vuelve a la chuleta.
    expect(screen.getByRole('link', { name: /Chuleta de reglas/ })).toBeVisible()
  })
})
