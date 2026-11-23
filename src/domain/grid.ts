import type { Garden, GridPoint, GridRect, Zone } from './types'

export function isInsideGarden(garden: Pick<Garden, 'cols' | 'rows'>, rect: GridRect): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x + rect.width <= garden.cols &&
    rect.y + rect.height <= garden.rows
  )
}

export function containsPoint(rect: GridRect, point: GridPoint): boolean {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  )
}

export function rectsOverlap(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** Zona que contiene una celda, si la hay. */
export function zoneAt(zones: Zone[], point: GridPoint): Zone | undefined {
  return zones.find((z) => containsPoint(z, point))
}

/** ¿La celda está ocupada por algún elemento (salvo el que se excluye)? */
export function isCellOccupied<T extends GridPoint & { id: string }>(
  items: T[],
  point: GridPoint,
  excludeId?: string,
): boolean {
  return items.some((i) => i.id !== excludeId && i.x === point.x && i.y === point.y)
}

/** Distancia de Chebyshev: las 8 celdas de alrededor están a distancia 1. */
export function chebyshev(a: GridPoint, b: GridPoint): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}
