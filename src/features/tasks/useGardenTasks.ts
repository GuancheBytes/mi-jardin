import { useCallback, useMemo } from 'react'
import { computeTasks, plantHealth, todayISO, type CareKind, type Plant } from '@/domain'
import { useCareTaskMutations, useCareTasks, usePlants, useSpecies } from '@/data/hooks'

/**
 * Une plantas, especies e historial para calcular las tareas del jardín.
 * Toda la lógica está en `domain/care.ts`; este hook solo conecta los datos.
 */
export function useGardenTasks(gardenId: string) {
  const plants = usePlants(gardenId)
  const careTasks = useCareTasks(gardenId)
  const { byId } = useSpecies()
  const { complete, undo } = useCareTaskMutations(gardenId)
  const today = todayISO()

  const tasks = useMemo(
    () => computeTasks(plants.data ?? [], byId, careTasks.data ?? [], today),
    [plants.data, byId, careTasks.data, today],
  )

  const healthOf = useCallback((plantId: string) => plantHealth(plantId, tasks), [tasks])

  const markDone = useCallback(
    (plant: Plant, kind: CareKind) =>
      complete.mutateAsync({ gardenId, plantId: plant.id, kind, doneOn: today }),
    [complete, gardenId, today],
  )

  return {
    tasks,
    today,
    healthOf,
    markDone,
    undo: (id: string) => undo.mutate(id),
    history: careTasks.data ?? [],
    plants: plants.data ?? [],
    speciesById: byId,
    isLoading: plants.isLoading || careTasks.isLoading,
  }
}
