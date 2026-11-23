import { addDays, diffDays, maxDate } from './dates'
import {
  CARE_KINDS,
  type CareKind,
  type CareTask,
  type DueTask,
  type ISODate,
  type Plant,
  type PlantHealth,
  type Species,
  type TaskStatus,
} from './types'

/** Fecha del último cuidado de un tipo para una planta, o `null` si nunca se hizo. */
export function lastDone(plantId: string, kind: CareKind, history: CareTask[]): ISODate | null {
  let last: ISODate | null = null
  for (const task of history) {
    if (task.plantId !== plantId || task.kind !== kind) continue
    last = last === null ? task.doneOn : maxDate(last, task.doneOn)
  }
  return last
}

/**
 * Próxima fecha en la que toca un cuidado.
 * Se cuenta desde el último cuidado hecho o, si no hay ninguno, desde la fecha de plantación.
 * Devuelve `null` si la especie no necesita ese cuidado.
 */
export function nextDueDate(
  plant: Plant,
  species: Species,
  kind: CareKind,
  history: CareTask[],
): ISODate | null {
  const every = species.care[kind]
  if (every === null || every <= 0) return null
  const base = lastDone(plant.id, kind, history) ?? plant.plantedOn
  return addDays(base, every)
}

export function taskStatus(dueOn: ISODate, today: ISODate): TaskStatus {
  const late = diffDays(dueOn, today)
  if (late > 0) return 'atrasada'
  if (late === 0) return 'hoy'
  return 'al-dia'
}

/** Todas las tareas (pendientes o futuras) de un conjunto de plantas. */
export function computeTasks(
  plants: Plant[],
  speciesById: ReadonlyMap<string, Species>,
  history: CareTask[],
  today: ISODate,
): DueTask[] {
  const tasks: DueTask[] = []
  for (const plant of plants) {
    const species = speciesById.get(plant.speciesId)
    if (!species) continue
    for (const kind of CARE_KINDS) {
      const dueOn = nextDueDate(plant, species, kind, history)
      if (dueOn === null) continue
      tasks.push({ plantId: plant.id, kind, dueOn, status: taskStatus(dueOn, today), daysLate: diffDays(dueOn, today) })
    }
  }
  return tasks
}

/** Tareas para el panel "Hoy": atrasadas primero (las más antiguas antes) y luego las de hoy. */
export function tasksForToday(tasks: DueTask[]): DueTask[] {
  return tasks
    .filter((t) => t.status !== 'al-dia')
    .sort((a, b) => b.daysLate - a.daysLate || CARE_KINDS.indexOf(a.kind) - CARE_KINDS.indexOf(b.kind))
}

/** Estado de una planta para el icono del mapa. */
export function plantHealth(plantId: string, tasks: DueTask[]): PlantHealth {
  const own = tasks.filter((t) => t.plantId === plantId)
  if (own.some((t) => t.status === 'atrasada')) return 'atrasada'
  if (own.some((t) => t.kind === 'riego' && t.status === 'hoy')) return 'necesita-riego'
  return 'sana'
}
