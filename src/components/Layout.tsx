import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { isDemoMode } from '../lib/api'
import { getStoredTheme, resolveTheme, setTheme } from '../lib/theme'
import { Avatar } from './Avatar'

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
  { to: '/reglas', label: 'Reglas', icon: '📖', end: false },
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
    <div className="overline border-b-2 border-[var(--color-border)] bg-[var(--color-accent)] px-4 py-1.5 text-center text-[0.6875rem] text-[var(--color-accent-ink)]">
      Modo demostración · los datos se guardan solo en este navegador.{' '}
      <Link to="/grupo" className="underline">
        Cómo conectar Supabase
      </Link>
    </div>
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

      <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="display flex items-center gap-2 text-lg text-[var(--color-brand)]"
          >
            <span aria-hidden="true">🎯</span>
            <span>Mesa</span>
          </Link>

          {group && (
            <Link to="/grupo" className="chip min-w-0 truncate">
              {group.name}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2">
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-3xl">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `overline flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${
                  isActive
                    ? 'text-[var(--color-brand)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
