import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { isDemoMode } from '../lib/api'
import { getStoredTheme, resolveTheme, setTheme } from '../lib/theme'
import { Avatar } from './ui'

const TABS = [
  { to: '/', label: 'Inicio', icon: '🎲', end: true },
  { to: '/partidas', label: 'Partidas', icon: '📋', end: false },
  { to: '/jugadores', label: 'Jugadores', icon: '👥', end: false },
  { to: '/reglas', label: 'Reglas', icon: '📖', end: false },
]

function ThemeToggle() {
  const [dark, setDark] = useState(() => resolveTheme(getStoredTheme()) === 'dark')

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-base"
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
    <div className="bg-[var(--color-accent)]/20 px-4 py-1.5 text-center text-xs text-[var(--color-text)]">
      Modo demostración · los datos se guardan solo en este navegador.{' '}
      <Link to="/grupo" className="font-semibold underline">
        Cómo conectar Supabase
      </Link>
    </div>
  )
}

export function Layout() {
  const { user } = useAuth()
  const { group } = useGroup()
  const location = useLocation()

  // Al cambiar de pantalla se vuelve arriba: sin esto, en móvil se entra a una
  // ficha por la mitad del scroll anterior.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />

      <header className="safe-top sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-lg" aria-hidden="true">
              🎯
            </span>
            <span>Mesa</span>
          </Link>

          {group && (
            <Link
              to="/grupo"
              className="min-w-0 truncate rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
            >
              {group.name}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link to="/grupo" aria-label="Tu grupo y tu cuenta">
                <Avatar name={user.displayName} size={36} registered />
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

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
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
