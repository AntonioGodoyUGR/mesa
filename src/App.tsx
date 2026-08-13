import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import { GamesProvider } from './context/GamesContext'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { RequireGroup } from './components/RequireGroup'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { GroupSetupPage } from './pages/GroupSetupPage'
import { GroupPage } from './pages/GroupPage'
import { NewMatchPage } from './pages/NewMatchPage'
import { MatchesPage } from './pages/MatchesPage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerProfilePage } from './pages/PlayerProfilePage'
import { RulesIndexPage } from './pages/RulesIndexPage'
import { RuleSheetPage } from './pages/RuleSheetPage'
import { CustomGamePage } from './pages/CustomGamePage'

export default function App() {
  // GitHub Pages sirve la app bajo /mesa/; el dev server y Vercel, bajo /.
  // BASE_URL lo resuelve Vite en tiempo de compilación.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <GroupProvider>
          <GamesProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Las reglas se consultan en la mesa, con o sin sesión iniciada. */}
                <Route path="reglas" element={<RulesIndexPage />} />
                <Route path="reglas/:slug" element={<RuleSheetPage />} />
                <Route path="login" element={<LoginPage />} />

                <Route element={<RequireAuth />}>
                  <Route path="grupo/nuevo" element={<GroupSetupPage />} />

                  <Route element={<RequireGroup />}>
                    <Route index element={<HomePage />} />
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
          </GamesProvider>
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
