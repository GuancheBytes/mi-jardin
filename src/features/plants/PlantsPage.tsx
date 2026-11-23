import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { firstFreeCell, zoneAt, type Garden } from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import { usePlantMutations, usePlants, useSpecies, useZones } from '@/data/hooks'
import { Button, EmptyState, ErrorMessage, inputClass, Loading, Modal } from '@/ui'
import { formatDate, plantName } from './format'
import { PlantForm, type PlantFormValues } from './PlantForm'

export function PlantsPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />
  return <PlantList garden={garden} />
}

function PlantList({ garden }: { garden: Garden }) {
  const navigate = useNavigate()
  const plants = usePlants(garden.id)
  const zones = useZones(garden.id)
  const { species, byId } = useSpecies()
  const { create } = usePlantMutations(garden.id)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plantList = useMemo(() => plants.data ?? [], [plants.data])
  const zoneList = useMemo(() => zones.data ?? [], [zones.data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return plantList
      .filter((p) => !q || plantName(p, byId.get(p.speciesId)).toLowerCase().includes(q) || byId.get(p.speciesId)?.name.toLowerCase().includes(q))
      .sort((a, b) => plantName(a, byId.get(a.speciesId)).localeCompare(plantName(b, byId.get(b.speciesId)), 'es'))
  }, [plantList, query, byId])

  if (plants.isLoading || zones.isLoading) return <Loading />

  function handleCreate(values: PlantFormValues) {
    const zone = zoneList.find((z) => z.id === values.zoneId)
    const area = zone ?? { x: 0, y: 0, width: garden.cols, height: garden.rows }
    const cell = firstFreeCell(area, plantList)
    if (!cell) {
      setError(zone ? `No queda hueco en «${zone.name}».` : 'No queda hueco libre en el jardín.')
      return
    }
    create.mutate(
      {
        gardenId: garden.id,
        speciesId: values.speciesId,
        nickname: values.nickname.trim() || null,
        plantedOn: values.plantedOn,
        notes: values.notes,
        photoUrl: null,
        ...cell,
      },
      { onSuccess: (plant) => void navigate(`/plantas/${plant.id}`) },
    )
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Plantas ({plantList.length})</h1>
        <Button onClick={() => (setError(null), setAdding(true))}>+ Añadir</Button>
      </div>

      <input
        type="search"
        aria-label="Buscar planta"
        placeholder="Buscar por nombre o especie…"
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="🌱">{plantList.length === 0 ? 'Aún no hay plantas. ¡Añade la primera!' : 'Ninguna planta coincide.'}</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
          {filtered.map((plant) => {
            const sp = byId.get(plant.speciesId)
            const zone = zoneAt(zoneList, plant)
            return (
              <li key={plant.id}>
                <Link to={`/plantas/${plant.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50">
                  {plant.photoUrl ? (
                    <img src={plant.photoUrl} alt="" className="size-11 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-leaf-50 text-2xl">
                      {sp?.emoji ?? '🌱'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{plantName(plant, sp)}</p>
                    <p className="truncate text-sm text-stone-500">
                      {plant.nickname && sp ? `${sp.name} · ` : ''}
                      {zone?.name ?? 'Sin zona'} · desde {formatDate(plant.plantedOn)}
                    </p>
                  </div>
                  <span aria-hidden className="text-stone-400">
                    ›
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={adding} title="Nueva planta" onClose={() => setAdding(false)}>
        <PlantForm species={species} zones={zoneList} submitLabel="Plantar" onSubmit={handleCreate} onCancel={() => setAdding(false)} />
      </Modal>
    </div>
  )
}
