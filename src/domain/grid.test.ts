import { chebyshev, containsPoint, firstFreeCell, isCellOccupied, isInsideGarden, rectsOverlap, zoneAt } from './grid'
import type { Zone } from './types'

const garden = { cols: 10, rows: 8 }
const zone = (id: string, x: number, y: number, width: number, height: number): Zone => ({
  id,
  gardenId: 'g1',
  name: id,
  kind: 'bancal',
  x,
  y,
  width,
  height,
})

describe('grid', () => {
  it('comprueba si un rectángulo cabe en el jardín', () => {
    expect(isInsideGarden(garden, { x: 0, y: 0, width: 10, height: 8 })).toBe(true)
    expect(isInsideGarden(garden, { x: 9, y: 0, width: 2, height: 1 })).toBe(false)
    expect(isInsideGarden(garden, { x: 0, y: 7, width: 1, height: 2 })).toBe(false)
    expect(isInsideGarden(garden, { x: -1, y: 0, width: 1, height: 1 })).toBe(false)
    expect(isInsideGarden(garden, { x: 0, y: -1, width: 1, height: 1 })).toBe(false)
    expect(isInsideGarden(garden, { x: 0, y: 0, width: 0, height: 1 })).toBe(false)
    expect(isInsideGarden(garden, { x: 0, y: 0, width: 1, height: 0 })).toBe(false)
  })

  it('detecta si un punto está dentro de un rectángulo', () => {
    const r = { x: 2, y: 2, width: 3, height: 2 }
    expect(containsPoint(r, { x: 2, y: 2 })).toBe(true)
    expect(containsPoint(r, { x: 4, y: 3 })).toBe(true)
    expect(containsPoint(r, { x: 5, y: 3 })).toBe(false)
    expect(containsPoint(r, { x: 1, y: 3 })).toBe(false)
    expect(containsPoint(r, { x: 3, y: 4 })).toBe(false)
    expect(containsPoint(r, { x: 3, y: 1 })).toBe(false)
  })

  it('detecta solapamientos', () => {
    const a = { x: 0, y: 0, width: 3, height: 3 }
    expect(rectsOverlap(a, { x: 2, y: 2, width: 2, height: 2 })).toBe(true)
    expect(rectsOverlap(a, { x: 3, y: 0, width: 2, height: 2 })).toBe(false)
    expect(rectsOverlap(a, { x: 0, y: 3, width: 2, height: 2 })).toBe(false)
  })

  it('encuentra la zona de una celda', () => {
    const zones = [zone('a', 0, 0, 2, 2), zone('b', 5, 5, 2, 2)]
    expect(zoneAt(zones, { x: 6, y: 5 })?.id).toBe('b')
    expect(zoneAt(zones, { x: 3, y: 3 })).toBeUndefined()
  })

  it('detecta celdas ocupadas, excluyendo un elemento', () => {
    const items = [{ id: 'p1', x: 1, y: 1 }]
    expect(isCellOccupied(items, { x: 1, y: 1 })).toBe(true)
    expect(isCellOccupied(items, { x: 1, y: 1 }, 'p1')).toBe(false)
    expect(isCellOccupied(items, { x: 2, y: 1 })).toBe(false)
  })

  it('encuentra la primera celda libre de un rectángulo', () => {
    const rect = { x: 0, y: 0, width: 2, height: 2 }
    const items = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1, y: 0 },
    ]
    expect(firstFreeCell(rect, items)).toEqual({ x: 0, y: 1 })
    expect(firstFreeCell({ x: 0, y: 0, width: 2, height: 1 }, items)).toBeNull()
  })

  it('calcula la distancia de Chebyshev', () => {
    expect(chebyshev({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(1)
    expect(chebyshev({ x: 0, y: 0 }, { x: 3, y: -1 })).toBe(3)
  })
})
