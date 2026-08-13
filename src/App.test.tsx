import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('las chuletas de reglas son accesibles desde la barra inferior', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('link', { name: /Reglas/ }))
    fireEvent.click(await screen.findByText('Carcassonne'))

    expect(await screen.findByText('Preparación')).toBeVisible()
    expect(screen.getByText('Puntuación')).toBeVisible()
  })
})
