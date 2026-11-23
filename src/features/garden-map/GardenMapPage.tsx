import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  companionsAt,
  summarizeCompanions,
  type CompanionMatch,
  isCellOccupied,
  isInsideGarden,
  rectsOverlap,
  todayISO,
  type Garden,
  type GridPoint,
  type GridRect,
  type PlantHealth,
  type Zone,
} from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import {
  useCompanionRules,
  usePlantMutations,
  usePlants,
  useSpecies,
  useZoneMutations,
  useZones,
} from '@/data/hooks'
import { ErrorMessage, Loading } from '@/ui'
import { CompanionNotice } from '@/features/companions/CompanionNotice'
import { plantName } from '@/features/plants/format'
import { useGardenTasks } from '@/features/tasks/useGardenTasks'
import { GardenGrid, type DropHint } from './GardenGrid'
import { HealthLegend } from './HealthLegend'
import { MapToolbar } from './MapToolbar'
import { useMapStore, type DragItem } from './mapStore'
import { SpeciesPalette } from './SpeciesPalette'
import { ZoneDialog, type ZoneFormValues } from './ZoneDialog'

export function GardenMapPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />
  return <GardenMapEditor garden={garden} />
}

function GardenMapEditor({ garden }: { garden: Garden }) {
  const gardenId = garden.id
  const navigate = useNavigate()
  const zones = useZones(gardenId)
  const plants = usePlants(gardenId)
  const { species, byId } = useSpecies()
  const zoneMutations = useZoneMutations(gardenId)
  const plantMutations = usePlantMutations(gardenId)

  const tool = useMapStore((s) => s.tool)
  const message = useMapStore((s) => s.message)
  const selectedSpeciesId = useMapStore((s) => s.selectedSpeciesId)
  const say = useMapStore((s) => s.say)

  const { healthOf } = useGardenTasks(gardenId)

  const rules = useCompanionRules().data ?? []

  const [newZoneRect, setNewZoneRect] = useState<GridRect | null>(null)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [notice, setNotice] = useState<{ title: string; matches: CompanionMatch[] } | null>(null)

  if (zones.isLoading || plants.isLoading) return <Loading />
  const zoneList = zones.data ?? []
  const plantList = plants.data ?? []
  const healthCounts: Record<PlantHealth, number> = { sana: 0, 'necesita-riego': 0, atrasada: 0 }
  for (const p of plantList) healthCounts[healthOf(p.id)]++

  /** Especie que se está arrastrando y planta a excluir (si se mueve una existente). */
  function dragged(item: DragItem | null) {
    if (!item) return null
    if (item.kind === 'species') return { speciesId: item.speciesId, excludeId: undefined }
    const plant = plantList.find((p) => p.id === item.plantId)
    return plant ? { speciesId: plant.speciesId, excludeId: plant.id } : null
  }

  function dropHint(cell: GridPoint): DropHint {
    const d = dragged(useMapStore.getState().drag)
    if (!d) return 'ok'
    if (isCellOccupied(plantList, cell, d.excludeId)) return 'blocked'
    const { good, bad } = summarizeCompanions(companionsAt(cell, d.speciesId, plantList, rules, d.excludeId))
    return bad > 0 ? 'bad' : good > 0 ? 'good' : 'ok'
  }

  function announce(name: string, speciesId: string, cell: GridPoint, excludeId?: string) {
    const matches = companionsAt(cell, speciesId, plantList, rules, excludeId)
    const { good, bad } = summarizeCompanions(matches)
    const summary = bad > 0 ? ` ⚠️ ${bad} incompatible${bad > 1 ? 's' : ''} cerca` : good > 0 ? ' ✅ buena compañía' : ''
    say(null)
    setNotice({ title: `${name} colocada.${summary}`, matches })
  }

  function placeSpecies(speciesId: string, cell: GridPoint) {
    if (isCellOccupied(plantList, cell)) return say('Esa casilla ya tiene una planta.')
    plantMutations.create.mutate({
      gardenId,
      speciesId,
      nickname: null,
      plantedOn: todayISO(),
      photoUrl: null,
      notes: '',
      ...cell,
    })
    announce(byId.get(speciesId)?.name ?? 'Planta', speciesId, cell)
  }

  function handleDrop(item: DragItem, cell: GridPoint) {
    if (item.kind === 'species') return placeSpecies(item.speciesId, cell)

    const plant = plantList.find((p) => p.id === item.plantId)
    if (!plant) return
    if (plant.x === cell.x && plant.y === cell.y) {
      void navigate(`/plantas/${plant.id}`)
      return
    }
    if (isCellOccupied(plantList, cell, plant.id)) return say('Esa casilla ya tiene una planta.')
    plantMutations.update.mutate({ ...plant, ...cell })
    announce(plantName(plant, byId.get(plant.speciesId)), plant.speciesId, cell, plant.id)
  }

  function handleZoneDrawn(rect: GridRect) {
    if (!isInsideGarden(garden, rect)) return
    if (zoneList.some((z) => rectsOverlap(z, rect))) return say('Las zonas no pueden solaparse.')
    setNewZoneRect(rect)
  }

  function saveNewZone(values: ZoneFormValues) {
    if (newZoneRect) zoneMutations.create.mutate({ gardenId, ...newZoneRect, ...values })
    setNewZoneRect(null)
  }

  function saveEditedZone(values: ZoneFormValues) {
    if (editingZone) zoneMutations.update.mutate({ ...editingZone, ...values })
    setEditingZone(null)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{garden.name}</h1>
      <MapToolbar />
      {tool === 'planta' && <SpeciesPalette species={species} />}

      <GardenGrid
        garden={garden}
        zones={zoneList}
        plants={plantList}
        speciesById={byId}
        healthOf={healthOf}
        dropHint={dropHint}
        onDrop={handleDrop}
        onCellClick={(cell) => selectedSpeciesId && placeSpecies(selectedSpeciesId, cell)}
        onZoneDrawn={handleZoneDrawn}
        onZoneClick={setEditingZone}
        onPlantClick={(plant) => void navigate(`/plantas/${plant.id}`)}
      />

      {notice && (
        <CompanionNotice title={notice.title} matches={notice.matches} speciesById={byId} onClose={() => setNotice(null)} />
      )}
      <p role="status" aria-live="polite" className="text-sm text-stone-600 empty:hidden">
        {message}
      </p>

      <HealthLegend counts={healthCounts} />

      <ZoneDialog open={newZoneRect !== null} onSave={saveNewZone} onClose={() => setNewZoneRect(null)} />
      <ZoneDialog
        open={editingZone !== null}
        initial={editingZone ? { name: editingZone.name, kind: editingZone.kind } : undefined}
        onSave={saveEditedZone}
        onDelete={() => {
          if (editingZone) zoneMutations.remove.mutate(editingZone.id)
          setEditingZone(null)
        }}
        onClose={() => setEditingZone(null)}
      />
    </div>
  )
}
