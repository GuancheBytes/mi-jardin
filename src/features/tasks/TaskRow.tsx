import { Link } from 'react-router'
import type { DueTask, Plant, Species } from '@/domain'
import { CARE_LABELS } from '@/features/plants/careLabels'
import { plantName, relativeDays } from '@/features/plants/format'
import { Button } from '@/ui'

interface TaskRowProps {
  task: DueTask
  plant: Plant
  species: Species | undefined
  today: string
  onDone?: () => void
}

const STATUS_CLASS: Record<DueTask['status'], string> = {
  atrasada: 'text-red-700',
  hoy: 'text-sky-700',
  'al-dia': 'text-stone-500',
}

export function TaskRow({ task, plant, species, today, onDone }: TaskRowProps) {
  const care = CARE_LABELS[task.kind]
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-xl">
        {species?.emoji ?? '🌱'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {care.icon} {care.verb}{' '}
          <Link to={`/plantas/${plant.id}`} className="underline decoration-stone-300">
            {plantName(plant, species)}
          </Link>
        </p>
        <p className={`text-sm ${STATUS_CLASS[task.status]}`}>
          {task.status === 'atrasada'
            ? `Atrasada ${task.daysLate} ${task.daysLate === 1 ? 'día' : 'días'}`
            : task.status === 'hoy'
              ? 'Toca hoy'
              : relativeDays(task.dueOn, today)}
        </p>
      </div>
      {onDone && (
        <Button size="sm" onClick={onDone} aria-label={`Marcar como hecho: ${care.verb} ${plantName(plant, species)}`}>
          ✓ Hecho
        </Button>
      )}
    </li>
  )
}
