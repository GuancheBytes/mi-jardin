import type { Plant } from '@/domain'
import { CARE_LABELS } from '@/features/plants/careLabels'
import { formatDate } from '@/features/plants/format'
import { Card } from '@/ui'
import { TaskRow } from './TaskRow'
import { useGardenTasks } from './useGardenTasks'

/** Próximos cuidados e historial de una planta, para su ficha. */
export function PlantCareCard({ plant }: { plant: Plant }) {
  const { tasks, today, markDone, history, speciesById } = useGardenTasks(plant.gardenId)
  const species = speciesById.get(plant.speciesId)
  const own = tasks.filter((t) => t.plantId === plant.id).sort((a, b) => b.daysLate - a.daysLate)
  const log = history
    .filter((h) => h.plantId === plant.id)
    .sort((a, b) => b.doneOn.localeCompare(a.doneOn))
    .slice(0, 5)

  return (
    <Card className="p-0">
      <h2 className="px-4 pt-4 font-semibold">Próximos cuidados</h2>
      <ul className="divide-y divide-stone-100">
        {own.map((task) => (
          <TaskRow
            key={task.kind}
            task={task}
            plant={plant}
            species={species}
            today={today}
            onDone={task.status === 'al-dia' ? undefined : () => void markDone(plant, task.kind)}
          />
        ))}
      </ul>
      {log.length > 0 && (
        <div className="border-t border-stone-100 px-4 py-3">
          <h3 className="mb-1 text-sm font-medium text-stone-600">Últimos cuidados</h3>
          <ul className="space-y-0.5 text-sm text-stone-600">
            {log.map((h) => (
              <li key={h.id}>
                {CARE_LABELS[h.kind].icon} {CARE_LABELS[h.kind].label} · {formatDate(h.doneOn)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
