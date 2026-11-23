import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { CareTask, Garden, Plant, Species, Zone } from '@/domain'
import { repository } from './index'
import type { NewCareTask, NewGarden, NewPlant, NewZone } from './repository'

/** Claves de caché de TanStack Query, centralizadas para invalidar de forma coherente. */
export const queryKeys = {
  species: ['species'] as const,
  companionRules: ['companion-rules'] as const,
  gardens: ['gardens'] as const,
  zones: (gardenId: string) => ['zones', gardenId] as const,
  plants: (gardenId: string) => ['plants', gardenId] as const,
  careTasks: (gardenId: string) => ['care-tasks', gardenId] as const,
  members: (gardenId: string) => ['members', gardenId] as const,
}

// ---------- Catálogo ----------

export function useSpecies() {
  const query = useQuery({
    queryKey: queryKeys.species,
    queryFn: () => repository.listSpecies(),
    staleTime: Infinity,
  })
  const byId = useMemo(
    () => new Map<string, Species>((query.data ?? []).map((s) => [s.id, s])),
    [query.data],
  )
  return { ...query, species: query.data ?? [], byId }
}

export function useCompanionRules() {
  return useQuery({
    queryKey: queryKeys.companionRules,
    queryFn: () => repository.listCompanionRules(),
    staleTime: Infinity,
  })
}

// ---------- Jardines ----------

export function useGardens() {
  return useQuery({ queryKey: queryKeys.gardens, queryFn: () => repository.listGardens() })
}

export function useCreateGarden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewGarden) => repository.createGarden(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.gardens }),
  })
}

export function useUpdateGarden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (garden: Garden) => repository.updateGarden(garden),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.gardens }),
  })
}

// ---------- Zonas ----------

export function useZones(gardenId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.zones(gardenId ?? ''),
    queryFn: () => repository.listZones(gardenId!),
    enabled: !!gardenId,
  })
}

export function useZoneMutations(gardenId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.zones(gardenId) })
  return {
    create: useMutation({ mutationFn: (z: NewZone) => repository.createZone(z), onSuccess: invalidate }),
    update: useMutation({ mutationFn: (z: Zone) => repository.updateZone(z), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => repository.deleteZone(id), onSuccess: invalidate }),
  }
}

// ---------- Plantas ----------

export function usePlants(gardenId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plants(gardenId ?? ''),
    queryFn: () => repository.listPlants(gardenId!),
    enabled: !!gardenId,
  })
}

export function usePlantMutations(gardenId: string) {
  const qc = useQueryClient()
  const key = queryKeys.plants(gardenId)
  const invalidate = () => qc.invalidateQueries({ queryKey: key })
  return {
    create: useMutation({ mutationFn: (p: NewPlant) => repository.createPlant(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (p: Plant) => repository.updatePlant(p),
      // Actualización optimista: al arrastrar en el mapa la planta se mueve al instante.
      onMutate: async (plant) => {
        await qc.cancelQueries({ queryKey: key })
        const previous = qc.getQueryData<Plant[]>(key)
        qc.setQueryData<Plant[]>(key, (list) => list?.map((p) => (p.id === plant.id ? plant : p)))
        return { previous }
      },
      onError: (_e, _p, ctx) => qc.setQueryData(key, ctx?.previous),
      onSettled: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => repository.deletePlant(id),
      onSuccess: () => {
        void invalidate()
        void qc.invalidateQueries({ queryKey: queryKeys.careTasks(gardenId) })
      },
    }),
  }
}

// ---------- Cuidados ----------

export function useCareTasks(gardenId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.careTasks(gardenId ?? ''),
    queryFn: () => repository.listCareTasks(gardenId!),
    enabled: !!gardenId,
  })
}

export function useCareTaskMutations(gardenId: string) {
  const qc = useQueryClient()
  const key = queryKeys.careTasks(gardenId)
  const invalidate = () => qc.invalidateQueries({ queryKey: key })
  return {
    complete: useMutation({
      mutationFn: (t: NewCareTask) => repository.completeCareTask(t),
      onSuccess: (task) => qc.setQueryData<CareTask[]>(key, (list) => [...(list ?? []), task]),
      onSettled: invalidate,
    }),
    undo: useMutation({ mutationFn: (id: string) => repository.undoCareTask(id), onSuccess: invalidate }),
  }
}

// ---------- Miembros ----------

export function useMembers(gardenId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.members(gardenId ?? ''),
    queryFn: () => repository.listMembers(gardenId!),
    enabled: !!gardenId,
  })
}

export function useMemberMutations(gardenId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.members(gardenId) })
  return {
    invite: useMutation({
      mutationFn: (email: string) => repository.inviteMember(gardenId, email),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => repository.removeMember(gardenId, userId),
      onSuccess: invalidate,
    }),
  }
}
