import type { ReactNode } from 'react'

/** Piezas pequeñas y sin estado que se repiten por toda la app. */

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-[var(--color-muted)]">
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h2 className="display text-base">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
      )}
      {action}
    </div>
  )
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null
  const message = error instanceof Error ? error.message : String(error)
  return (
    <p role="alert" className="note note-danger">
      {message}
    </p>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="display truncate text-xl">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  )
}

/** Iniciales sobre un color derivado del nombre: evita depender de imágenes. */
export function Avatar({
  name,
  size = 36,
  registered = false,
}: {
  name: string
  size?: number
  registered?: boolean
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-border)] font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: `hsl(${hash} 45% 42%)`,
      }}
      aria-hidden="true"
    >
      {initials || '?'}
      {!registered && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[8px] text-[var(--color-muted)]"
          title="Invitado sin cuenta"
        >
          ·
        </span>
      )}
    </span>
  )
}
