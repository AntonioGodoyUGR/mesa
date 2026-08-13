import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isDemoMode } from '../lib/api'
import { ErrorNote, Spinner } from '../components/ui'

export function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (loading) return <Spinner label="Comprobando sesión…" />
  if (user) return <Navigate to={from} replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    try {
      if (mode === 'signin') await signIn(email.trim(), password)
      else await signUp(email.trim(), password, displayName.trim())
      navigate(from, { replace: true })
    } catch (cause) {
      setError(cause)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-6">
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">
          🎯
        </span>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Mesa</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Los resultados de vuestras partidas, en un sitio.
        </p>
      </div>

      {isDemoMode && (
        <p className="rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-2 text-sm">
          Modo demostración: no hace falta cuenta, entra directamente.
        </p>
      )}

      <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1 text-sm font-medium">
        {(
          [
            ['signin', 'Entrar'],
            ['signup', 'Crear cuenta'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`flex-1 rounded-lg py-2 transition-colors ${
              mode === value
                ? 'bg-[var(--color-surface)] shadow-sm'
                : 'text-[var(--color-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="flex flex-col gap-3" onSubmit={submit}>
        {mode === 'signup' && (
          <label className="flex flex-col gap-1">
            <span className="label">Nombre</span>
            <input
              className="input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              required
              maxLength={40}
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="label">Correo</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Contraseña</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </label>

        <ErrorNote error={error} />

        <button type="submit" className="btn btn-primary mt-1" disabled={busy}>
          {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--color-muted)]">
        Solo hace falta una cuenta por partida: el resto pueden jugar como invitados.
      </p>
    </div>
  )
}
