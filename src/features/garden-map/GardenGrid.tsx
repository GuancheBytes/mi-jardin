import { useEffect, useEffectEvent, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { Garden, GridPoint, GridRect, Plant, PlantHealth, Species, Zone } from '@/domain'
import { cellFromPoint, rectStyle } from './geometry'
import { rectFromCorners, useMapStore, type DragItem } from './mapStore'
import { PlantToken } from './PlantToken'
import { zoneClass } from './zoneStyles'

export type DropHint = 'ok' | 'good' | 'bad' | 'blocked'

interface GardenGridProps {
  garden: Garden
  zones: Zone[]
  plants: Plant[]
  speciesById: ReadonlyMap<string, Species>
  healthOf?: (plantId: string) => PlantHealth
  /** Cómo se vería soltar el arrastre actual en una celda (para colorearla). */
  dropHint?: (cell: GridPoint) => DropHint
  /** Se suelta un arrastre sobre una celda. Si es la misma celda de la planta, cuenta como toque. */
  onDrop: (item: DragItem, cell: GridPoint) => void
  onCellClick: (cell: GridPoint) => void
  onZoneDrawn: (rect: GridRect) => void
  onZoneClick: (zone: Zone) => void
  onPlantClick: (plant: Plant) => void
}

const HINT_CLASS: Record<DropHint, string> = {
  ok: 'bg-sky-400/30 ring-sky-500',
  good: 'bg-green-400/40 ring-green-600',
  bad: 'bg-amber-400/40 ring-amber-600',
  blocked: 'bg-red-400/30 ring-red-500',
}

/** Cuadrícula del jardín: dibuja zonas y plantas y gestiona el arrastre con pointer events. */
export function GardenGrid(props: GardenGridProps) {
  const { garden, zones, plants, speciesById, healthOf, dropHint } = props
  const gridRef = useRef<HTMLDivElement>(null)
  const { tool, drag, hoverCell, zoneDraft } = useMapStore()
  const { setHoverCell, endDrag, startDrag, startZone, updateZone, clearZone } = useMapStore.getState()

  // Mientras hay un arrastre activo escuchamos en `window` para seguir al puntero
  // aunque salga del elemento donde empezó (por ejemplo, desde la paleta).
  const onDrop = useEffectEvent((item: DragItem, cell: GridPoint) => props.onDrop(item, cell))
  const isDragging = drag !== null
  useEffect(() => {
    if (!isDragging) return
    const toCell = (e: PointerEvent) =>
      gridRef.current ? cellFromPoint(e.clientX, e.clientY, gridRef.current, garden.cols, garden.rows) : null
    const move = (e: PointerEvent) => setHoverCell(toCell(e))
    const up = (e: PointerEvent) => {
      const cell = toCell(e)
      const item = useMapStore.getState().drag
      endDrag()
      if (cell && item) onDrop(item, cell)
    }
    const cancel = () => endDrag()
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
  }, [isDragging, garden.cols, garden.rows, setHoverCell, endDrag])

  const cellOf = (e: ReactPointerEvent) =>
    gridRef.current ? cellFromPoint(e.clientX, e.clientY, gridRef.current, garden.cols, garden.rows) : null

  function handleGridPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const cell = cellOf(e)
    if (!cell) return
    if (tool === 'zona') {
      e.currentTarget.setPointerCapture(e.pointerId)
      startZone(cell)
    } else if (tool === 'planta') {
      props.onCellClick(cell)
    }
  }

  function handleGridPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (tool !== 'zona' || !zoneDraft) return
    const cell = cellOf(e)
    if (cell) updateZone(cell)
  }

  function handleGridPointerUp() {
    if (tool !== 'zona' || !zoneDraft) return
    const rect = rectFromCorners(zoneDraft.start, zoneDraft.end)
    clearZone()
    props.onZoneDrawn(rect)
  }

  const draggedPlantId = drag?.kind === 'plant' ? drag.plantId : null

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-2 shadow-sm ring-1 ring-stone-200">
      <div
        ref={gridRef}
        role="grid"
        aria-label={`Mapa de ${garden.name}: ${garden.cols} por ${garden.rows} casillas`}
        onPointerDown={handleGridPointerDown}
        onPointerMove={handleGridPointerMove}
        onPointerUp={handleGridPointerUp}
        className={`relative select-none ${tool === 'zona' ? 'cursor-crosshair touch-none' : ''}`}
        style={{
          aspectRatio: `${garden.cols} / ${garden.rows}`,
          minWidth: `${garden.cols * 1.75}rem`,
          backgroundImage:
            'linear-gradient(to right, rgb(214 211 209 / .6) 1px, transparent 1px), linear-gradient(to bottom, rgb(214 211 209 / .6) 1px, transparent 1px)',
          backgroundSize: `${100 / garden.cols}% ${100 / garden.rows}%`,
          backgroundColor: '#fbfaf7',
        }}
      >
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => tool === 'mover' && props.onZoneClick(zone)}
            className={`absolute rounded-md p-0.5 text-left ring-1 ring-inset ${zoneClass(zone.kind)} ${
              tool === 'mover' ? '' : 'pointer-events-none'
            }`}
            style={rectStyle(zone, garden.cols, garden.rows)}
          >
            <span className="line-clamp-1 text-[10px] font-medium text-stone-700">{zone.name}</span>
          </button>
        ))}

        {zoneDraft && (
          <div
            className="pointer-events-none absolute rounded-md bg-leaf-500/20 ring-2 ring-leaf-600"
            style={rectStyle(rectFromCorners(zoneDraft.start, zoneDraft.end), garden.cols, garden.rows)}
          />
        )}

        {drag && hoverCell && (
          <div
            className={`pointer-events-none absolute rounded-md ring-2 ${HINT_CLASS[dropHint?.(hoverCell) ?? 'ok']}`}
            style={rectStyle({ ...hoverCell, width: 1, height: 1 }, garden.cols, garden.rows)}
          />
        )}

        {plants.map((plant) => (
          <PlantToken
            key={plant.id}
            plant={plant}
            species={speciesById.get(plant.speciesId)}
            health={healthOf?.(plant.id)}
            dragging={plant.id === draggedPlantId}
            interactive={tool === 'mover'}
            style={rectStyle({ ...plant, width: 1, height: 1 }, garden.cols, garden.rows)}
            onDragStart={() => startDrag({ kind: 'plant', plantId: plant.id })}
            onClick={() => props.onPlantClick(plant)}
          />
        ))}
      </div>
    </div>
  )
}
