import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  isCellOccupied,
  isInsideGarden,
  rectsOverlap,
  todayISO,
  type Garden,
  type GridPoint,
  type GridRect,
  type Zone,
} from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import { usePlantMutations, usePlants, useSpecies, useZoneMutations, useZones } from '@/data/hooks'
import { ErrorMessage, Loading } from '@/ui'
import { GardenGrid } from './GardenGrid'
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

  const [newZoneRect, setNewZoneRect] = useState<GridRect | null>(null)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  if (zones.isLoading || plants.isLoading) return <Loading />
  const zoneList = zones.data ?? []
  const plantList = plants.data ?? []

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
    say(`${byId.get(speciesId)?.name ?? 'Planta'} plantada.`)
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
        dropHint={(cell) => (isCellOccupied(plantList, cell, dragPlantId()) ? 'blocked' : 'ok')}
        onDrop={handleDrop}
        onCellClick={(cell) => selectedSpeciesId && placeSpecies(selectedSpeciesId, cell)}
        onZoneDrawn={handleZoneDrawn}
        onZoneClick={setEditingZone}
        onPlantClick={(plant) => void navigate(`/plantas/${plant.id}`)}
      />

      <p role="status" aria-live="polite" className="min-h-6 text-sm text-stone-600">
        {message}
      </p>

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

function dragPlantId(): string | undefined {
  const drag = useMapStore.getState().drag
  return drag?.kind === 'plant' ? drag.plantId : undefined
}
