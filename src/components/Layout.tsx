import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { isDemoMode } from '../lib/api'
import { getStoredTheme, resolveTheme, setTheme } from '../lib/theme'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

interface Tab {
  to: string
  label: string
  icon: string
  end: boolean
  /** Solo tiene sentido con un grupo detrás: partidas y jugadores son suyos. */
  needsGroup?: boolean
  /** Lo contrario: la invitación a empezar, que sobra en cuanto hay grupo. */
  guestOnly?: boolean
}

const TABS: Tab[] = [
  { to: '/', label: 'Inicio', icon: '🎲', end: true },
  { to: '/partidas', label: 'Partidas', icon: '📋', end: false, needsGroup: true },
  { to: '/jugadores', label: 'Jugadores', icon: '👥', end: false, needsGroup: true },
  { to: '/grupo/nuevo', label: 'Empezar', icon: '✨', end: false, guestOnly: true },
]

function ThemeToggle() {
  const [dark, setDark] = useState(() => resolveTheme(getStoredTheme()) === 'dark')

  return (
    <button
      type="button"
      className="hard-sm flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-base"
      onClick={() => {
        const next = !dark
        setDark(next)
        setTheme(next ? 'dark' : 'light')
      }}
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <Link
      to="/grupo"
      className="overline block truncate border-b-2 border-[var(--color-border)] bg-[var(--color-accent)] px-4 py-1.5 text-center text-[0.6875rem] text-[var(--color-accent-ink)]"
    >
      Demostración · datos solo en este navegador · <u>conectar Supabase</u>
    </Link>
  )
}

export function Layout() {
  const { user } = useAuth()
  const { group, me } = useGroup()
  const location = useLocation()

  // Una pestaña que lleva a una pantalla vetada es una promesa incumplida: la
  // barra enseña solo lo que se puede abrir desde donde está el visitante.
  const tabs = TABS.filter((tab) => (tab.needsGroup ? !!group : true)).filter((tab) =>
    tab.guestOnly ? !group : true,
  )

  // Al cambiar de pantalla se vuelve arriba: sin esto, en móvil se entra a una
  // ficha por la mitad del scroll anterior.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />

      <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 text-[var(--color-brand)]">
            <Logo className="text-[0.95rem] sm:text-lg" />
          </Link>

          {group && (
            <Link to="/grupo" className="chip min-w-0 truncate">
              {group.name}
            </Link>
          )}

          {/* La barra de secciones vive aquí en el marcado, pero en móvil `.tabbar`
              la clava abajo, al alcance del pulgar. Ver `src/index.css`. */}
          <nav className="tabbar" aria-label="Secciones">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `overline tabbar-link ${isActive ? 'tabbar-link-on' : ''}`
                }
              >
                <span className="tabbar-icon" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            <ThemeToggle />
            {user ? (
              // Con grupo, el avatar lleva a tu propia ficha, que es donde se cambia.
              <Link
                to={me ? `/jugadores/${me.id}` : '/grupo'}
                aria-label={me ? 'Tu ficha y tu avatar' : 'Tu grupo y tu cuenta'}
              >
                <Avatar
                  name={me?.display_name ?? user.displayName}
                  avatar={me?.avatar_url}
                  size={36}
                  registered
                />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary px-3 py-1.5 text-sm">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
