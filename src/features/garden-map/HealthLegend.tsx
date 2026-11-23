import type { PlantHealth } from '@/domain'
import { HEALTH_BADGE } from './PlantToken'

const DOT: Record<PlantHealth, string> = {
  sana: 'bg-green-600',
  'necesita-riego': 'bg-sky-500',
  atrasada: 'bg-red-600',
}

export function HealthLegend({ counts }: { counts: Record<PlantHealth, number> }) {
  return (
    <ul aria-label="Leyenda de estados" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
      {(Object.keys(HEALTH_BADGE) as PlantHealth[]).map((h) => (
        <li key={h} className="flex items-center gap-1.5">
          <span aria-hidden className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${DOT[h]}`}>
            {HEALTH_BADGE[h].icon}
          </span>
          {HEALTH_BADGE[h].label} ({counts[h]})
        </li>
      ))}
    </ul>
  )
}
