import { AvatarFace } from './Avatar'
import {
  ACCESSORIES,
  BACKGROUNDS,
  EXPRESSIONS,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  KINDS,
  SHIRT_COLORS,
  SKIN_TONES,
  randomAvatar,
  type AvatarLook,
} from '../lib/avatar'

/**
 * El taller del muñeco: la cara grande arriba y un rasgo por fila.
 *
 * Es un componente controlado y nada más —no guarda ni conoce al jugador—, así que
 * sirve igual para el tuyo y para el de un invitado. Cada opción se ve antes de
 * elegirla: los colores son su propio botón y los peinados y complementos se
 * previsualizan con el muñeco entero, que es como se entiende de un vistazo.
 */
export function AvatarEditor({
  look,
  onChange,
}: {
  look: AvatarLook
  onChange: (next: AvatarLook) => void
}) {
  const humano = look.kind === 'humano'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <AvatarFace look={look} className="h-40 w-40" />
        <button
          type="button"
          className="btn btn-ghost px-3 py-1.5 text-sm"
          onClick={() => onChange(randomAvatar())}
        >
          🎲 Sorpréndeme
        </button>
      </div>

      <Looks
        label="Personaje"
        options={KINDS}
        selected={look.kind}
        preview={(kind) => ({ ...look, kind })}
        onPick={(kind) => onChange({ ...look, kind })}
      />

      <Colors
        label="Fondo"
        colors={BACKGROUNDS}
        selected={look.background}
        onPick={(background) => onChange({ ...look, background })}
      />
      <Colors
        label={humano ? 'Camiseta' : 'Color'}
        colors={SHIRT_COLORS}
        selected={look.shirt}
        onPick={(shirt) => onChange({ ...look, shirt })}
      />

      {humano ? (
        <>
          <Colors
            label="Piel"
            colors={SKIN_TONES}
            selected={look.skin}
            onPick={(skin) => onChange({ ...look, skin })}
          />
          <Looks
            label="Pelo"
            options={HAIR_STYLES}
            selected={look.hair}
            preview={(hair) => ({ ...look, hair })}
            onPick={(hair) => onChange({ ...look, hair })}
          />
          {look.hair !== 'calvo' && (
            <Colors
              label="Color del pelo"
              colors={HAIR_COLORS}
              selected={look.hairColor}
              onPick={(hairColor) => onChange({ ...look, hairColor })}
            />
          )}
          <Looks
            label="Sombrero"
            options={HATS}
            selected={look.hat}
            preview={(hat) => ({ ...look, hat })}
            onPick={(hat) => onChange({ ...look, hat })}
          />
          <Looks
            label="Complemento"
            options={ACCESSORIES}
            selected={look.accessory}
            preview={(accessory) => ({ ...look, accessory })}
            onPick={(accessory) => onChange({ ...look, accessory })}
          />
        </>
      ) : (
        <Looks
          label="Expresión"
          options={EXPRESSIONS}
          selected={look.expression}
          preview={(expression) => ({ ...look, expression })}
          onPick={(expression) => onChange({ ...look, expression })}
        />
      )}
    </div>
  )
}

/** Fila de colores: cada uno es su propia muestra. */
function Colors({
  label,
  colors,
  selected,
  onPick,
}: {
  label: string
  colors: readonly string[]
  selected: number
  onPick: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${index + 1}`}
            aria-pressed={selected === index}
            onClick={() => onPick(index)}
            className={`h-9 w-9 rounded-full border-2 border-[var(--color-border)] transition-transform ${
              selected === index ? 'hard-sm scale-110' : 'opacity-70'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Fila de rasgos con forma: peinados, sombreros y complementos.
 * Cada botón enseña el muñeco tal y como quedaría con esa opción puesta.
 */
function Looks<T extends string>({
  label,
  options,
  selected,
  preview,
  onPick,
}: {
  label: string
  options: { id: T; label: string }[]
  selected: T
  preview: (id: T) => AvatarLook
  onPick: (id: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-4">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={`${label}: ${option.label}`}
            aria-pressed={selected === option.id}
            onClick={() => onPick(option.id)}
            className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg border-2 p-1.5 text-[10px] leading-tight ${
              selected === option.id
                ? 'hard-sm border-[var(--color-border)] bg-[var(--color-surface-2)] font-bold'
                : 'border-transparent text-[var(--color-muted)]'
            }`}
          >
            <AvatarFace look={preview(option.id)} className="h-12 w-12 shrink-0" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
