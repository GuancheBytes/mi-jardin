import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGardens } from './hooks'

interface CurrentGardenState {
  gardenId: string | null
  setGardenId: (id: string) => void
}

/** Recuerda qué jardín está abierto entre sesiones. */
export const useCurrentGardenStore = create<CurrentGardenState>()(
  persist(
    (set) => ({
      gardenId: null,
      setGardenId: (gardenId) => set({ gardenId }),
    }),
    { name: 'mi-jardin:current-garden' },
  ),
)

/** Jardín abierto. Si el guardado ya no existe, usa el primero disponible. */
export function useCurrentGarden() {
  const gardens = useGardens()
  const gardenId = useCurrentGardenStore((s) => s.gardenId)
  const list = gardens.data ?? []
  const garden = list.find((g) => g.id === gardenId) ?? list[0]
  return { garden, gardens: list, isLoading: gardens.isLoading, error: gardens.error }
}
