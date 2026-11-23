import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { repository } from './index'
import { queryKeys } from './hooks'

/** Refresca los datos cuando otro miembro del jardín cambia algo (solo con Supabase). */
export function useGardenRealtime(gardenId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!gardenId || !repository.subscribe) return
    return repository.subscribe(gardenId, (table) => {
      const key =
        table === 'plants'
          ? queryKeys.plants(gardenId)
          : table === 'zones'
            ? queryKeys.zones(gardenId)
            : queryKeys.careTasks(gardenId)
      void queryClient.invalidateQueries({ queryKey: key })
    })
  }, [gardenId, queryClient])
}
