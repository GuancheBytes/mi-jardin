import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CARE_KINDS, zoneAt, type Garden, type Plant } from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import { usePlantMutations, usePlants, useSpecies, useZones } from '@/data/hooks'
import { PlantCareCard } from '@/features/tasks/PlantCareCard'
import { Button, Card, EmptyState, ErrorMessage, Loading, Modal } from '@/ui'
import { CARE_LABELS } from './careLabels'
import { formatDate, frequencyLabel, plantName } from './format'
import { PlantForm, type PlantFormValues } from './PlantForm'
import { PlantPhoto } from './PlantPhoto'

export function PlantDetailPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />
  return <PlantDetail garden={garden} />
}

function PlantDetail({ garden }: { garden: Garden }) {
  const { plantId } = useParams()
  const navigate = useNavigate()
  const plants = usePlants(garden.id)
  const zones = useZones(garden.id)
  const { species, byId } = useSpecies()
  const { update, remove } = usePlantMutations(garden.id)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (plants.isLoading) return <Loading />
  const plant = plants.data?.find((p) => p.id === plantId)
  if (!plant) {
    return (
      <EmptyState icon="🔍">
        No encontramos esta planta. <Link to="/plantas" className="text-leaf-700 underline">Volver a la lista</Link>
      </EmptyState>
    )
  }

  const sp = byId.get(plant.speciesId)
  const zone = zoneAt(zones.data ?? [], plant)
  const save = (changes: Partial<Plant>) => update.mutate({ ...plant, ...changes })

  function handleEdit(values: PlantFormValues) {
    save({
      speciesId: values.speciesId,
      nickname: values.nickname.trim() || null,
      plantedOn: values.plantedOn,
      notes: values.notes,
    })
    setEditing(false)
  }

  return (
    <div className="space-y-4">
      <Link to="/plantas" className="text-sm text-leaf-700">
        ‹ Plantas
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{plantName(plant, sp)}</h1>
        {sp && (
          <p className="text-stone-500">
            {sp.name} · <i>{sp.scientificName}</i>
          </p>
        )}
      </div>

      <PlantPhoto plant={plant} species={sp} onChange={(photoUrl) => save({ photoUrl })} />

      <Card>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-stone-500">Plantada</dt>
            <dd className="font-medium">{formatDate(plant.plantedOn)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Ubicación</dt>
            <dd className="font-medium">
              <Link to="/mapa" className="underline decoration-stone-300">
                {zone?.name ?? 'Sin zona'} ({plant.x + 1}, {plant.y + 1})
              </Link>
            </dd>
          </div>
        </dl>
      </Card>

      <PlantCareCard plant={plant} />

      {sp && (
        <Card>
          <h2 className="mb-2 font-semibold">Cuidados de la especie</h2>
          <ul className="space-y-1 text-sm">
            {CARE_KINDS.map((kind) => (
              <li key={kind} className="flex justify-between">
                <span>
                  {CARE_LABELS[kind].icon} {CARE_LABELS[kind].label}
                </span>
                <span className="text-stone-600">{frequencyLabel(sp.care[kind])}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="mb-2 font-semibold">Notas</h2>
        <p className="text-sm whitespace-pre-line text-stone-700">{plant.notes || 'Sin notas.'}</p>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          ✏️ Editar
        </Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Borrar
        </Button>
      </div>

      <Modal open={editing} title="Editar planta" onClose={() => setEditing(false)}>
        <PlantForm
          species={species}
          initial={{ ...plant, nickname: plant.nickname ?? '' }}
          submitLabel="Guardar"
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <Modal open={confirmDelete} title="¿Borrar planta?" onClose={() => setConfirmDelete(false)}>
        <p className="mb-4 text-stone-600">Se borrará la ficha y su historial de cuidados. No se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => remove.mutate(plant.id, { onSuccess: () => void navigate('/plantas') })}
          >
            Borrar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
