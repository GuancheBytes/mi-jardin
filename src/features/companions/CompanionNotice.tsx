import type { CompanionMatch, Species } from '@/domain'
import { plantName } from '@/features/plants/format'

interface CompanionNoticeProps {
  title: string
  matches: CompanionMatch[]
  speciesById: ReadonlyMap<string, Species>
  onClose?: () => void
}

/** Aviso tras colocar una planta: vecinas compatibles (✅) e incompatibles (⚠️). */
export function CompanionNotice({ title, matches, speciesById, onClose }: CompanionNoticeProps) {
  const bad = matches.filter((m) => m.kind === 'incompatible')
  const good = matches.filter((m) => m.kind === 'compatible')

  return (
    <div
      role="status"
      className={`rounded-xl p-3 text-sm ring-1 ${
        bad.length > 0 ? 'bg-amber-50 ring-amber-300' : good.length > 0 ? 'bg-green-50 ring-green-300' : 'bg-white ring-stone-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{title}</p>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="text-stone-500">
            ×
          </button>
        )}
      </div>
      {matches.length === 0 ? (
        <p className="text-stone-600">Sin vecinas con asociación conocida.</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {[...bad, ...good].map((m) => {
            const sp = speciesById.get(m.plant.speciesId)
            return (
              <li key={m.plant.id}>
                {m.kind === 'compatible' ? '✅' : '⚠️'} {sp?.emoji} {plantName(m.plant, sp)}
                {m.note && <span className="text-stone-600"> — {m.note}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
