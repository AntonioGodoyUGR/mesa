import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CUSTOM_PALETTE,
  MAX_CUSTOM_FIELDS,
  blankCustomGame,
  blankField,
  formatRuleLines,
  formatScoringRows,
  formatTurnPhases,
  isCustomSlug,
  normalizeDefinition,
  parseRuleLines,
  parseScoringRows,
  parseTurnPhases,
  themeFrom,
  validateDefinition,
} from '../games/custom'
import { applyUniqueField, emptyScores } from '../games/registry'
import { DIFFICULTY_OPTIONS } from '../games/filters'
import {
  MAX_DICE,
  MAX_DICE_FACES,
  MAX_TIMER_SECONDS,
  MAX_TOOLS,
  MIN_TIMER_SECONDS,
  TOOL_KIND_ICONS,
  TOOL_KIND_LABELS,
  blankTool,
  formatSeconds,
} from '../games/tools'
import type {
  GameDefinition,
  GameTool,
  PlayTime,
  RuleSheet,
  ScoreValues,
} from '../games/types'
import { GameTools } from '../components/GameTools'
import { ScoreFieldEditor } from '../components/ScoreFieldEditor'
import { ScoreSheet, type ScoreRow } from '../components/ScoreSheet'
import { RuleSheetView } from '../components/RuleSheetView'
import { ErrorNote, PageHeader, Spinner } from '../components/ui'
import { useGame } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'
import { resizeToWebp } from '../lib/image'

/** El formulario de reglas es texto plano: una línea = un elemento de la lista. */
interface RulesForm {
  players: string
  duration: string
  setup: string
  turn: string
  scoring: string
  endCondition: string
  reminders: string
  linkLabel: string
  linkUrl: string
}

function rulesFormFrom(rules: RuleSheet | undefined): RulesForm {
  return {
    players: rules?.players ?? '',
    duration: rules?.duration ?? '',
    setup: formatRuleLines(rules?.setup),
    turn: formatTurnPhases(rules?.turn),
    scoring: formatScoringRows(rules?.scoring),
    endCondition: rules?.endCondition ?? '',
    reminders: formatRuleLines(rules?.reminders),
    linkLabel: rules?.officialLink?.label ?? '',
    linkUrl: rules?.officialLink?.url ?? '',
  }
}

function rulesFrom(form: RulesForm): RuleSheet {
  return {
    players: form.players,
    duration: form.duration,
    setup: parseRuleLines(form.setup),
    turn: parseTurnPhases(form.turn),
    scoring: parseScoringRows(form.scoring),
    endCondition: form.endCondition,
    reminders: parseRuleLines(form.reminders),
    officialLink: { label: form.linkLabel, url: form.linkUrl },
  }
}

/**
 * Creador de juegos propios: `/juegos/nuevo` y `/juegos/:slug/editar`.
 *
 * Compone un `GameDefinition` igual que los que viven en `definitions/`, así que el
 * resto de la aplicación no distingue entre un juego del catálogo y uno de aquí. La
 * vista previa reutiliza los mismos componentes que la partida de verdad.
 */
export function CustomGamePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { group } = useGroup()
  const { game: existing, loading } = useGame(slug)

  const [draft, setDraft] = useState<GameDefinition | null>(null)
  const [rulesForm, setRulesForm] = useState<RulesForm | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ScoreValues[]>([{}, {}])
  const fileInput = useRef<HTMLInputElement>(null)

  // El borrador arranca del juego que se edita, o en blanco. Se hace aquí y no en
  // `useState(() => …)` porque al entrar por URL directa el juego llega por red.
  const base = draft ?? existing ?? (slug ? null : blankCustomGame())
  const form = rulesForm ?? rulesFormFrom(existing?.rules)

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const played = (matchesQuery.data ?? []).filter(
    (match) => match.game_slug === slug,
  ).length

  const game = useMemo<GameDefinition | null>(() => {
    if (!base) return null
    return { ...base, rules: rulesFrom(form) }
  }, [base, form])

  const problems = useMemo(
    () => (game ? validateDefinition(normalizeDefinition(game)) : []),
    [game],
  )

  const save = useMutation({
    mutationFn: async (definition: GameDefinition) => {
      return api.saveCustomGame({
        groupId: group!.id,
        slug: slug ?? undefined,
        definition: normalizeDefinition(definition),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.games(group!.id) })
      navigate('/', { replace: true })
    },
  })

  const remove = useMutation({
    mutationFn: () => api.deleteCustomGame(slug!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.games(group!.id) })
      navigate('/', { replace: true })
    },
  })

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const resized = await resizeToWebp(file)
      return api.uploadGameImage(group!.id, resized)
    },
    onSuccess: (url) => update({ imageUrl: url }),
  })

  if (loading || (slug && !existing && matchesQuery.isLoading)) return <Spinner />
  if (!group) return null
  // Los juegos del catálogo se editan en su fichero, no desde la app.
  if (slug && (!isCustomSlug(slug) || (existing && !existing.groupId))) {
    return <Navigate to="/" replace />
  }
  if (!game || !base) return <Navigate to="/" replace />

  function update(patch: Partial<GameDefinition>) {
    setDraft({ ...(base as GameDefinition), ...patch })
  }

  /**
   * Duración en minutos. Dejar los dos números a cero es válido: el juego se guarda
   * sin duración y entonces no aparece al filtrar por ella.
   */
  function updatePlayTime(patch: Partial<PlayTime>) {
    const current = game!.playTime
    const next: PlayTime = { min: current?.min ?? 0, max: current?.max ?? 0, ...patch }
    // Subir el mínimo arrastra al máximo: nadie quiere ver «de 60 a 30 minutos».
    if (patch.min !== undefined && next.max < next.min) next.max = next.min
    update({ playTime: next.min > 0 || next.max > 0 ? next : undefined })
  }

  function updateField(index: number, next: GameDefinition['fields'][number]) {
    const fields = [...game!.fields]
    fields[index] = next
    update({ fields })
  }

  /** Los accesorios se guardan como lista; sin ninguno, el juego se guarda sin `tools`. */
  function updateTools(tools: GameTool[]) {
    update({ tools: tools.length > 0 ? tools : undefined })
  }

  function updateTool(index: number, next: GameTool) {
    const tools = [...(game!.tools ?? [])]
    tools[index] = next
    updateTools(tools)
  }

  function moveField(index: number, direction: -1 | 1) {
    const fields = [...game!.fields]
    const target = index + direction
    if (target < 0 || target >= fields.length) return
    ;[fields[index], fields[target]] = [fields[target], fields[index]]
    update({ fields })
  }

  async function pickImage(file: File) {
    setImageError(null)
    try {
      await upload.mutateAsync(file)
    } catch (error) {
      // `resizeToWebp` lanza `ImageError`, que ya trae un mensaje presentable.
      setImageError(
        error instanceof Error ? error.message : 'No se ha podido subir la imagen',
      )
    }
  }

  const rows: ScoreRow[] = ['Ana', 'Beto'].map((name, index) => ({
    playerId: `preview-${index}`,
    name,
    registered: index === 0,
    scores: { ...emptyScores(game), ...preview[index] },
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={slug ? 'Editar juego' : 'Nuevo juego'}
        subtitle={`Solo lo verá ${group.name}`}
        action={
          <button
            type="button"
            className="btn btn-ghost shrink-0 px-3 py-1.5 text-sm"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        }
      />

      <Block title="El juego" icon="🎲" defaultOpen>
        <div className="flex items-start gap-3">
          <label className="flex flex-col gap-1">
            <span className="label">Emoji</span>
            <input
              className="input w-16 text-center text-2xl"
              value={game.icon}
              maxLength={4}
              onChange={(event) => update({ icon: event.target.value })}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="label">Nombre</span>
            <input
              className="input"
              placeholder="El juego de los jueves"
              value={game.name}
              maxLength={60}
              onChange={(event) => update({ name: event.target.value })}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="label">Frase corta (opcional)</span>
          <input
            className="input"
            placeholder="Cartas, farol y mucha suerte"
            value={game.tagline}
            maxLength={80}
            onChange={(event) => update({ tagline: event.target.value })}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="label">Portada (opcional)</span>
          <div className="flex items-center gap-3">
            {game.imageUrl ? (
              <img
                src={game.imageUrl}
                alt=""
                className="hard-sm h-20 w-20 shrink-0 rounded-lg border-2 border-[var(--color-border)] object-cover"
              />
            ) : (
              <span
                className="game-wash hard-sm flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--color-border)] text-3xl"
                style={{ '--game': game.theme.primary } as CSSProperties}
                aria-hidden="true"
              >
                {game.icon}
              </span>
            )}

            <div className="flex flex-col gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) void pickImage(file)
                }}
              />
              <button
                type="button"
                className="btn btn-ghost px-3 py-1.5 text-sm"
                disabled={upload.isPending}
                onClick={() => fileInput.current?.click()}
              >
                {upload.isPending ? 'Subiendo…' : game.imageUrl ? 'Cambiar' : 'Subir imagen'}
              </button>
              {game.imageUrl && (
                <button
                  type="button"
                  className="btn btn-ghost px-3 py-1.5 text-sm text-[var(--color-danger)]"
                  onClick={() => update({ imageUrl: undefined })}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
          {imageError && <ErrorNote error={imageError} />}
        </div>

        <div className="flex flex-col gap-2">
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Color ${color}`}
                onClick={() => update({ theme: themeFrom(color) })}
                className={`h-9 w-9 rounded-full border-2 border-[var(--color-border)] transition-transform ${
                  game.theme.primary === color ? 'hard-sm scale-110' : 'opacity-70'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="label">Jugadores (mín.)</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={game.minPlayers}
              onChange={(event) => update({ minPlayers: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Jugadores (máx.)</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={game.maxPlayers}
              onChange={(event) => update({ maxPlayers: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Dura (mín. minutos)</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              min={0}
              max={1440}
              placeholder="Sin decir"
              value={game.playTime?.min || ''}
              onChange={(event) => updatePlayTime({ min: Number(event.target.value) || 0 })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Dura (máx. minutos)</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              min={0}
              max={1440}
              placeholder="Sin decir"
              value={game.playTime?.max || ''}
              onChange={(event) => updatePlayTime({ max: Number(event.target.value) || 0 })}
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            <span className="label">Dificultad</span>
            <select
              className="input"
              value={game.difficulty ?? ''}
              onChange={(event) =>
                update({
                  difficulty:
                    (event.target.value as GameDefinition['difficulty']) || undefined,
                })
              }
            >
              <option value="">Sin especificar</option>
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.icon} {option.label} · {option.hint}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Cómo se llaman los puntos</span>
            <input
              className="input"
              placeholder="Puntos de victoria"
              value={game.scoreLabel}
              maxLength={30}
              onChange={(event) => update({ scoreLabel: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">En corto</span>
            <input
              className="input"
              placeholder="PV"
              value={game.scoreLabelShort}
              maxLength={6}
              onChange={(event) => update({ scoreLabelShort: event.target.value })}
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            <span className="label">Puntuación objetivo (opcional)</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              placeholder="Sin meta fija"
              value={game.targetScore ?? ''}
              onChange={(event) =>
                update({
                  targetScore:
                    event.target.value === '' ? undefined : Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      </Block>

      <Block title="Puntuación" icon="🔢" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="label">El total…</span>
            <select
              className="input"
              value={game.totalMode}
              onChange={(event) => {
                const totalMode = event.target.value as GameDefinition['totalMode']
                // Cambiar de modo invalida los `isTotal`: en `computed` no puede haber
                // ninguno y en `explicit` tiene que haber exactamente uno.
                const fields = game.fields.map((field, index) => {
                  const next = { ...field }
                  delete next.isTotal
                  if (totalMode === 'explicit' && index === 0) next.isTotal = true
                  return next
                })
                update({ totalMode, fields })
              }}
            >
              <option value="explicit">Lo apunto yo</option>
              <option value="computed">Se suma de los campos</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Gana…</span>
            <select
              className="input"
              value={game.winnerRule}
              onChange={(event) =>
                update({ winnerRule: event.target.value as GameDefinition['winnerRule'] })
              }
            >
              <option value="highest">La puntuación más alta</option>
              <option value="lowest">La puntuación más baja</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          {game.fields.map((field, index) => (
            <ScoreFieldEditor
              key={index}
              field={field}
              index={index}
              count={game.fields.length}
              keyLocked={played > 0 && !!existing?.fields.some((old) => old.key === field.key)}
              computed={game.totalMode === 'computed'}
              onChange={(next) => updateField(index, next)}
              onRemove={() =>
                update({ fields: game.fields.filter((_, position) => position !== index) })
              }
              onMove={(direction) => moveField(index, direction)}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={game.fields.length >= MAX_CUSTOM_FIELDS}
          onClick={() =>
            update({
              fields: [...game.fields, blankField(game.fields.map((field) => field.key))],
            })
          }
        >
          ＋ Añadir campo
        </button>

        {played > 0 && (
          <p className="text-xs text-[var(--color-muted)]">
            Este juego ya tiene {played} partida(s) apuntadas: las claves internas de sus
            campos no se pueden cambiar sin perder esas puntuaciones.
          </p>
        )}
      </Block>

      <Block title="En la mesa (opcional)" icon="🎲">
        <p className="text-xs text-[var(--color-muted)]">
          Dados y temporizadores para usar mientras jugáis. Salen en la ficha del juego y
          al apuntar la partida, encima de la hoja de puntuación.
        </p>

        <div className="flex flex-col gap-2">
          {(game.tools ?? []).map((tool, index) => (
            <ToolEditor
              key={index}
              tool={tool}
              onChange={(next) => updateTool(index, next)}
              onRemove={() =>
                updateTools((game.tools ?? []).filter((_, position) => position !== index))
              }
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['dice', 'timer'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className="btn btn-ghost px-3 py-1.5 text-sm"
              disabled={(game.tools ?? []).length >= MAX_TOOLS}
              onClick={() => updateTools([...(game.tools ?? []), blankTool(kind)])}
            >
              ＋ {TOOL_KIND_LABELS[kind]}
            </button>
          ))}
        </div>

        {(game.tools ?? []).length > 0 && <GameTools game={game} />}
      </Block>

      <Block title="Reglas (opcional)" icon="📖">
        <p className="text-xs text-[var(--color-muted)]">
          Todo esto se puede dejar en blanco. Escribe un elemento por línea; en el turno y
          en la tabla de puntuación, separa las dos partes con «·».
        </p>

        <div className="grid grid-cols-2 gap-2">
          <RuleInput
            label="Jugadores"
            placeholder="2-6 jugadores"
            value={form.players}
            onChange={(players) => setRulesForm({ ...form, players })}
          />
          <RuleInput
            label="Duración"
            placeholder="45 min"
            value={form.duration}
            onChange={(duration) => setRulesForm({ ...form, duration })}
          />
        </div>

        <RuleArea
          label="Preparación"
          placeholder={'Repartir 7 cartas a cada uno\nDejar el mazo en el centro'}
          value={form.setup}
          onChange={(setup) => setRulesForm({ ...form, setup })}
        />
        <RuleArea
          label="El turno"
          placeholder={'Robar · Coge una carta del mazo\nJugar · Baja una combinación'}
          value={form.turn}
          onChange={(turn) => setRulesForm({ ...form, turn })}
        />
        <RuleArea
          label="Tabla de puntuación"
          placeholder={'Cada carta baja · 1 punto\nComodín sin usar · −10'}
          value={form.scoring}
          onChange={(scoring) => setRulesForm({ ...form, scoring })}
        />
        <RuleInput
          label="Fin de la partida"
          placeholder="Acaba cuando alguien se queda sin cartas."
          value={form.endCondition}
          onChange={(endCondition) => setRulesForm({ ...form, endCondition })}
        />
        <RuleArea
          label="No se te olvide"
          placeholder={'Hay que avisar al quedarse con una carta'}
          value={form.reminders}
          onChange={(reminders) => setRulesForm({ ...form, reminders })}
        />

        <div className="grid grid-cols-2 gap-2">
          <RuleInput
            label="Enlace: texto"
            placeholder="Reglas completas"
            value={form.linkLabel}
            onChange={(linkLabel) => setRulesForm({ ...form, linkLabel })}
          />
          <RuleInput
            label="Enlace: dirección"
            placeholder="https://…"
            value={form.linkUrl}
            onChange={(linkUrl) => setRulesForm({ ...form, linkUrl })}
          />
        </div>
      </Block>

      <Block title="Vista previa" icon="👀" defaultOpen>
        <p className="text-xs text-[var(--color-muted)]">
          Así se apuntará una partida. Toca los campos para probarlos.
        </p>

        <ScoreSheet
          game={game}
          rows={rows}
          winnerPlayerId={null}
          onPickWinner={() => {}}
          onFieldChange={(rowIndex, fieldKey, value) => {
            const field = game.fields.find((candidate) => candidate.key === fieldKey)
            if (field?.uniquePerMatch) {
              setPreview(
                applyUniqueField(game, rows.map((row) => row.scores), fieldKey, rowIndex, !!value),
              )
              return
            }
            setPreview((current) =>
              current.map((scores, index) =>
                index === rowIndex ? { ...scores, [fieldKey]: value } : scores,
              ),
            )
          }}
        />

        <RuleSheetView game={game} />
      </Block>

      {problems.map((problem) => (
        <p
          key={problem}
          className="note note-danger"
        >
          {problem}
        </p>
      ))}

      <ErrorNote error={save.error} />
      <ErrorNote error={remove.error} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={problems.length > 0 || save.isPending || upload.isPending}
        onClick={() => save.mutate(game)}
      >
        {save.isPending ? 'Guardando…' : slug ? 'Guardar cambios' : 'Crear juego'}
      </button>

      {slug && (
        <button
          type="button"
          className="btn btn-ghost text-[var(--color-danger)]"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`¿Borrar «${game.name}»? No se puede deshacer.`)) {
              remove.mutate()
            }
          }}
        >
          {remove.isPending ? 'Borrando…' : 'Borrar juego'}
        </button>
      )}
    </div>
  )
}

/** Apartado plegable del formulario: la pantalla es larga y en el móvil no cabe. */
function Block({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        className="display flex items-center gap-2 text-left text-base"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">{icon}</span>
        {title}
        <span
          className="ml-auto text-[var(--color-muted)] transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : undefined }}
          aria-hidden="true"
        >
          ›
        </span>
      </button>
      {open && <div className="flex flex-col gap-3">{children}</div>}
    </section>
  )
}

/**
 * Un accesorio del juego. Los dos tipos comparten el nombre opcional y se diferencian
 * en los números: cuántos dados y de cuántas caras, o cuánto dura la cuenta atrás.
 */
function ToolEditor({
  tool,
  onChange,
  onRemove,
}: {
  tool: GameTool
  onChange: (next: GameTool) => void
  onRemove: () => void
}) {
  return (
    <article className="card flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <span className="display text-sm">
          <span aria-hidden="true">{TOOL_KIND_ICONS[tool.kind]}</span>{' '}
          {TOOL_KIND_LABELS[tool.kind]}
        </span>
        <button
          type="button"
          className="btn btn-ghost ml-auto px-2 py-1 text-sm text-[var(--color-danger)]"
          onClick={onRemove}
        >
          ✕<span className="sr-only">Quitar {TOOL_KIND_LABELS[tool.kind]}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tool.kind === 'dice' ? (
          <>
            <label className="flex flex-col gap-1">
              <span className="label">Cuántos</span>
              <input
                className="input tnum"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_DICE}
                value={tool.count}
                onChange={(event) =>
                  onChange({ ...tool, count: Number(event.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="label">Caras</span>
              <input
                className="input tnum"
                type="number"
                inputMode="numeric"
                min={2}
                max={MAX_DICE_FACES}
                value={tool.faces}
                onChange={(event) =>
                  onChange({ ...tool, faces: Number(event.target.value) })
                }
              />
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-1">
            <span className="label">Segundos · {formatSeconds(tool.seconds)}</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              min={MIN_TIMER_SECONDS}
              max={MAX_TIMER_SECONDS}
              step={5}
              value={tool.seconds}
              onChange={(event) =>
                onChange({ ...tool, seconds: Number(event.target.value) })
              }
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="label">Cómo se llama (opcional)</span>
          <input
            className="input"
            placeholder={tool.kind === 'dice' ? 'Dados de producción' : 'Reloj de turno'}
            value={tool.label ?? ''}
            maxLength={30}
            onChange={(event) => onChange({ ...tool, label: event.target.value })}
          />
        </label>
      </div>
    </article>
  )
}

function RuleInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function RuleArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <textarea
        className="input min-h-24 resize-y py-2 leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
