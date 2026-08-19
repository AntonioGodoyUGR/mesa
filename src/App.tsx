import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import { GamesProvider } from './context/GamesContext'
import { LibraryProvider } from './context/LibraryContext'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { RequireGroup } from './components/RequireGroup'
import { HomePage } from './pages/HomePage'

/**
 * Cada página, en su propio trozo de JavaScript.
 *
 * La portada se queda estática porque es donde cae todo el mundo: cargarla aparte
 * añadiría un viaje de red justo en el camino más transitado. Las demás no: quien entra
 * a mirar el catálogo no tiene por qué bajarse el editor de juegos, el detalle de una
 * partida ni el perfil de un jugador. El `Suspense` que las espera está en `Layout`,
 * alrededor del `<Outlet />`, para que la cabecera y la barra de secciones no
 * parpadeen mientras llega el trozo.
 *
 * `lazy()` quiere un `export default` y aquí todo se exporta con nombre; de ahí el
 * `.then` que lo envuelve.
 */
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const GroupSetupPage = lazy(() =>
  import('./pages/GroupSetupPage').then((module) => ({ default: module.GroupSetupPage })),
)
const GroupPage = lazy(() =>
  import('./pages/GroupPage').then((module) => ({ default: module.GroupPage })),
)
const NewMatchPage = lazy(() =>
  import('./pages/NewMatchPage').then((module) => ({ default: module.NewMatchPage })),
)
const MatchesPage = lazy(() =>
  import('./pages/MatchesPage').then((module) => ({ default: module.MatchesPage })),
)
const MatchDetailPage = lazy(() =>
  import('./pages/MatchDetailPage').then((module) => ({ default: module.MatchDetailPage })),
)
const PlayersPage = lazy(() =>
  import('./pages/PlayersPage').then((module) => ({ default: module.PlayersPage })),
)
const PlayerProfilePage = lazy(() =>
  import('./pages/PlayerProfilePage').then((module) => ({
    default: module.PlayerProfilePage,
  })),
)
const CustomGamePage = lazy(() =>
  import('./pages/CustomGamePage').then((module) => ({ default: module.CustomGamePage })),
)
const GamePage = lazy(() =>
  import('./pages/GamePage').then((module) => ({ default: module.GamePage })),
)
const LibraryPage = lazy(() =>
  import('./pages/LibraryPage').then((module) => ({ default: module.LibraryPage })),
)

/** `/reglas/:slug` ya no existe: cae en la pestaña «Reglas» de la ficha del juego. */
function RuleSheetRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/juegos/${slug}?tab=reglas`} replace />
}

export default function App() {
  // GitHub Pages sirve la app bajo /table-tracker/; el dev server y Vercel, bajo /.
  // BASE_URL lo resuelve Vite en tiempo de compilación.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <GroupProvider>
          <GamesProvider>
            <LibraryProvider>
              <Routes>
                <Route element={<Layout />}>
                  {/* Consultar es público: el catálogo, las reglas y la ficha de
                      cada juego se leen sin cuenta. La sesión hace falta cuando
                      empiezan a existir datos tuyos —tu perfil, tu grupo, tus
                      juegos—, no antes. */}
                  <Route index element={<HomePage />} />
                  {/* La página de Reglas independiente desapareció: la ficha del
                      juego la absorbió como pestaña. Se conservan redirecciones
                      para no romper enlaces guardados ni la caché de la PWA. */}
                  <Route path="reglas" element={<Navigate to="/" replace />} />
                  <Route path="reglas/:slug" element={<RuleSheetRedirect />} />
                  {/* `juegos/nuevo` gana a `juegos/:slug` aunque se declare
                      después: un tramo fijo pesa más que uno dinámico. */}
                  <Route path="juegos/:slug" element={<GamePage />} />
                  <Route path="login" element={<LoginPage />} />

                  <Route element={<RequireAuth />}>
                    <Route path="grupo/nuevo" element={<GroupSetupPage />} />
                    {/* La biblioteca es de la cuenta: no hace falta tener grupo. */}
                    <Route path="biblioteca" element={<LibraryPage />} />

                    <Route element={<RequireGroup />}>
                      <Route path="grupo" element={<GroupPage />} />
                      <Route path="nueva/:slug" element={<NewMatchPage />} />
                      <Route path="partidas" element={<MatchesPage />} />
                      <Route path="partidas/:id" element={<MatchDetailPage />} />
                      <Route path="jugadores" element={<PlayersPage />} />
                      <Route path="jugadores/:id" element={<PlayerProfilePage />} />
                      <Route path="juegos/nuevo" element={<CustomGamePage />} />
                      <Route path="juegos/:slug/editar" element={<CustomGamePage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </LibraryProvider>
          </GamesProvider>
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
