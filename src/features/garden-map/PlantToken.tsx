import type { CSSProperties } from 'react'
import type { Plant, PlantHealth, Species } from '@/domain'

export const HEALTH_BADGE: Record<PlantHealth, { icon: string; label: string }> = {
  sana: { icon: '✓', label: 'Sana' },
  'necesita-riego': { icon: '💧', label: 'Necesita riego' },
  atrasada: { icon: '!', label: 'Cuidados atrasados' },
}

const BADGE_CLASS: Record<PlantHealth, string> = {
  sana: 'bg-green-600 text-white',
  'necesita-riego': 'bg-sky-500 text-white',
  atrasada: 'bg-red-600 text-white',
}

interface PlantTokenProps {
  plant: Plant
  species: Species | undefined
  health?: PlantHealth | undefined
  dragging: boolean
  interactive: boolean
  style: CSSProperties
  onDragStart: () => void
  /** Solo para teclado; con ratón o dedo, el toque se detecta al soltar en la misma celda. */
  onClick: () => void
}

export function PlantToken(props: PlantTokenProps) {
  const { plant, species, health, dragging, interactive, style } = props
  const name = plant.nickname ?? species?.name ?? 'Planta'
  const healthLabel = health ? `, ${HEALTH_BADGE[health].label}` : ''

  return (
    <button
      type="button"
      aria-label={`${name}${healthLabel}`}
      title={name}
      onPointerDown={(e) => {
        if (!interactive || e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        props.onDragStart()
      }}
      onClick={(e) => {
        if (e.detail === 0) props.onClick()
      }}
      className={`absolute flex touch-none items-center justify-center p-0.5 ${
        interactive ? 'cursor-grab' : 'pointer-events-none'
      } ${dragging ? 'opacity-40' : ''}`}
      style={style}
    >
      <span className="relative flex aspect-square h-full max-h-full items-center justify-center rounded-full bg-white text-[clamp(0.9rem,3vw,1.4rem)] shadow ring-1 ring-stone-300">
        <span aria-hidden>{species?.emoji ?? '🌱'}</span>
        {health && health !== 'sana' && (
          <span
            aria-hidden
            className={`absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold ${BADGE_CLASS[health]}`}
          >
            {HEALTH_BADGE[health].icon}
          </span>
        )}
      </span>
    </button>
  )
}
