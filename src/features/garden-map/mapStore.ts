import { create } from 'zustand'
import type { GridPoint, GridRect } from '@/domain'

export type MapTool = 'mover' | 'zona' | 'planta'

/** Lo que se está arrastrando: una planta ya colocada o una especie nueva desde la paleta. */
export type DragItem = { kind: 'plant'; plantId: string } | { kind: 'species'; speciesId: string }

interface MapState {
  tool: MapTool
  selectedSpeciesId: string | null
  drag: DragItem | null
  /** Celda bajo el puntero durante un arrastre. */
  hoverCell: GridPoint | null
  /** Rectángulo que se está dibujando con la herramienta de zona. */
  zoneDraft: { start: GridPoint; end: GridPoint } | null
  message: string | null

  setTool: (tool: MapTool) => void
  selectSpecies: (id: string | null) => void
  startDrag: (item: DragItem) => void
  setHoverCell: (cell: GridPoint | null) => void
  endDrag: () => void
  startZone: (cell: GridPoint) => void
  updateZone: (cell: GridPoint) => void
  clearZone: () => void
  say: (message: string | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  tool: 'mover',
  selectedSpeciesId: null,
  drag: null,
  hoverCell: null,
  zoneDraft: null,
  message: null,

  setTool: (tool) => set({ tool, zoneDraft: null, message: null }),
  selectSpecies: (selectedSpeciesId) => set({ selectedSpeciesId }),
  startDrag: (drag) => set({ drag, hoverCell: null, message: null }),
  setHoverCell: (hoverCell) => set({ hoverCell }),
  endDrag: () => set({ drag: null, hoverCell: null }),
  startZone: (cell) => set({ zoneDraft: { start: cell, end: cell } }),
  updateZone: (cell) => set((s) => (s.zoneDraft ? { zoneDraft: { ...s.zoneDraft, end: cell } } : s)),
  clearZone: () => set({ zoneDraft: null }),
  say: (message) => set({ message }),
}))

/** Rectángulo normalizado a partir de dos esquinas cualesquiera. */
export function rectFromCorners(a: GridPoint, b: GridPoint): GridRect {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return { x, y, width: Math.abs(a.x - b.x) + 1, height: Math.abs(a.y - b.y) + 1 }
}
