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

/** Un número grande con su etiqueta debajo. Se usan en rejilla de tres o cuatro. */
export function Stat({
  value,
  label,
  hint,
}: {
  value: string
  label: string
  /** Aclaración pequeña bajo la etiqueta, cuando el número no se explica solo. */
  hint?: string
}) {
  return (
    <div className="card px-3 py-4 text-center">
      <p className="tnum text-2xl font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  )
}
