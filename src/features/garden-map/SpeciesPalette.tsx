import type { Species } from '@/domain'
import { useMapStore } from './mapStore'

/** Paleta horizontal de especies. Se pueden arrastrar al mapa o seleccionar con un toque. */
export function SpeciesPalette({ species }: { species: Species[] }) {
  const selected = useMapStore((s) => s.selectedSpeciesId)
  const { selectSpecies, startDrag } = useMapStore.getState()

  return (
    <ul aria-label="Especies" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
      {species.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            aria-pressed={selected === s.id}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              e.preventDefault()
              selectSpecies(s.id)
              startDrag({ kind: 'species', speciesId: s.id })
            }}
            onClick={(e) => e.detail === 0 && selectSpecies(s.id)}
            className={`flex w-16 shrink-0 touch-none flex-col items-center rounded-xl px-1 py-2 text-xs ring-1 ${
              selected === s.id ? 'bg-leaf-50 ring-leaf-600' : 'bg-white ring-stone-200'
            }`}
          >
            <span aria-hidden className="text-2xl">
              {s.emoji}
            </span>
            <span className="line-clamp-1">{s.name}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
