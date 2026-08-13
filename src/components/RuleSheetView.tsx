import type { GameDefinition } from '../games/types'

/**
 * Chuleta de reglas: esquemática, de un vistazo, y la misma estructura para
 * todos los juegos porque `RuleSheet` es datos, no prosa.
 *
 * Cada apartado es opcional: los juegos integrados los traen todos, los que crea un
 * usuario pueden traer solo los que le apetezca escribir (o ninguno).
 *
 * Nota: no incluimos ni redistribuimos el reglamento oficial (tiene copyright);
 * esto es un resumen propio y, si acaso, un enlace a la web del editor.
 */
export function RuleSheetView({ game }: { game: GameDefinition }) {
  const rules = game.rules ?? {}
  const color = game.theme.primary

  const hasContent =
    !!rules.setup?.length ||
    !!rules.turn?.length ||
    !!rules.scoring?.length ||
    !!rules.endCondition ||
    !!rules.reminders?.length

  return (
    <article className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-xs">
        {rules.players && <Chip icon="👥" text={rules.players} color={color} />}
        {rules.duration && <Chip icon="⏱️" text={rules.duration} color={color} />}
        <Chip
          icon={game.winnerRule === 'lowest' ? '⬇️' : '⬆️'}
          text={
            game.targetScore
              ? `Meta: ${game.targetScore} ${game.scoreLabelShort}`
              : `Gana ${game.winnerRule === 'lowest' ? 'menos' : 'más'} ${game.scoreLabelShort}`
          }
          color={color}
        />
      </div>

      {!hasContent && (
        <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          Este juego todavía no tiene chuleta de reglas.
        </p>
      )}

      {!!rules.setup?.length && (
        <Section title="Preparación" icon="🧩" color={color}>
          <ol className="flex flex-col gap-1.5">
            {rules.setup.map((step, index) => (
              <li key={step} className="flex gap-2.5 text-sm">
                <span
                  className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {!!rules.turn?.length && (
        <Section title="El turno" icon="🔄" color={color}>
          <ul className="flex flex-col gap-2">
            {rules.turn.map((phase) => (
              <li key={phase.name} className="text-sm">
                <span className="font-semibold">{phase.name}</span>
                <span className="text-[var(--color-muted)]"> · {phase.detail}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!rules.scoring?.length && (
        <Section title="Puntuación" icon="🏆" color={color}>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-border)]">
              {rules.scoring.map((row) => (
                <tr key={row.what}>
                  <td className="py-1.5 pr-3">{row.what}</td>
                  <td className="tnum py-1.5 text-right font-semibold whitespace-nowrap">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {rules.endCondition && (
        <Section title="Fin de la partida" icon="🏁" color={color}>
          <p className="text-sm">{rules.endCondition}</p>
        </Section>
      )}

      {!!rules.reminders?.length && (
        <Section title="No se te olvide" icon="💡" color={color}>
          <ul className="flex flex-col gap-1.5">
            {rules.reminders.map((reminder) => (
              <li key={reminder} className="flex gap-2 text-sm">
                <span aria-hidden="true">·</span>
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {rules.officialLink && (
        <p className="text-xs text-[var(--color-muted)]">
          Resumen propio, no sustituye al reglamento.{' '}
          <a
            className="underline"
            href={rules.officialLink.url}
            target="_blank"
            rel="noreferrer"
          >
            {rules.officialLink.label}
          </a>
        </p>
      )}
    </article>
  )
}

function Chip({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium"
      style={{ borderColor: `${color}55`, backgroundColor: `${color}12` }}
    >
      <span aria-hidden="true">{icon}</span>
      {text}
    </span>
  )
}

function Section({
  title,
  icon,
  color,
  children,
}: {
  title: string
  icon: string
  color: string
  children: React.ReactNode
}) {
  return (
    <section className="card p-4">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
        style={{ color }}
      >
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}
