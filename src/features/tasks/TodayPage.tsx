import { useState } from 'react'
import { tasksForToday, type CareTask, type DueTask, type Garden } from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import { CARE_LABELS } from '@/features/plants/careLabels'
import { Button, EmptyState, ErrorMessage, Loading } from '@/ui'
import { TaskRow } from './TaskRow'
import { useGardenTasks } from './useGardenTasks'

const UPCOMING_DAYS = 7

export function TodayPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />
  return <TodayPanel garden={garden} />
}

function TodayPanel({ garden }: { garden: Garden }) {
  const { tasks, today, markDone, undo, plants, speciesById, isLoading } = useGardenTasks(garden.id)
  const [lastDone, setLastDone] = useState<{ task: CareTask; label: string } | null>(null)

  if (isLoading) return <Loading />

  const pending = tasksForToday(tasks)
  const overdue = pending.filter((t) => t.status === 'atrasada')
  const dueToday = pending.filter((t) => t.status === 'hoy')
  const upcoming = tasks
    .filter((t) => t.status === 'al-dia' && -t.daysLate <= UPCOMING_DAYS)
    .sort((a, b) => b.daysLate - a.daysLate)
  const plantById = new Map(plants.map((p) => [p.id, p]))

  async function handleDone(task: DueTask) {
    const plant = plantById.get(task.plantId)
    if (!plant) return
    const done = await markDone(plant, task.kind)
    setLastDone({ task: done, label: `${CARE_LABELS[task.kind].verb} ${plant.nickname ?? speciesById.get(plant.speciesId)?.name ?? ''}` })
  }

  const renderList = (list: DueTask[], withDone: boolean) => (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
      {list.map((task) => {
        const plant = plantById.get(task.plantId)
        if (!plant) return null
        return (
          <TaskRow
            key={`${task.plantId}-${task.kind}`}
            task={task}
            plant={plant}
            species={speciesById.get(plant.speciesId)}
            today={today}
            onDone={withDone ? () => void handleDone(task) : undefined}
          />
        )
      })}
    </ul>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Hoy en {garden.name}</h1>
        <p className="text-stone-500">
          {pending.length === 0
            ? 'Todo al día 🌞'
            : `${pending.length} ${pending.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}`}
        </p>
      </div>

      {lastDone && (
        <div role="status" className="flex items-center justify-between rounded-lg bg-leaf-50 px-4 py-2 text-sm text-leaf-800">
          <span>✓ {lastDone.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              undo(lastDone.task.id)
              setLastDone(null)
            }}
          >
            Deshacer
          </Button>
        </div>
      )}

      {overdue.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-red-700">Atrasadas ({overdue.length})</h2>
          {renderList(overdue, true)}
        </section>
      )}

      {dueToday.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-sky-700">Para hoy ({dueToday.length})</h2>
          {renderList(dueToday, true)}
        </section>
      )}

      {pending.length === 0 && <EmptyState icon="🌿">No hay nada pendiente. ¡Buen trabajo!</EmptyState>}

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-stone-600">Próximos {UPCOMING_DAYS} días</h2>
          {renderList(upcoming, false)}
        </section>
      )}
    </div>
  )
}
