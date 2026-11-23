import type { GridPoint, GridRect } from '@/domain'

/** Celda de la cuadrícula bajo unas coordenadas de pantalla, o `null` si está fuera. */
export function cellFromPoint(
  clientX: number,
  clientY: number,
  element: HTMLElement,
  cols: number,
  rows: number,
): GridPoint | null {
  const rect = element.getBoundingClientRect()
  const x = Math.floor(((clientX - rect.left) / rect.width) * cols)
  const y = Math.floor(((clientY - rect.top) / rect.height) * rows)
  if (x < 0 || y < 0 || x >= cols || y >= rows) return null
  return { x, y }
}

/** Estilo CSS en porcentajes para colocar un rectángulo sobre la cuadrícula. */
export function rectStyle(rect: GridRect, cols: number, rows: number) {
  return {
    left: `${(rect.x / cols) * 100}%`,
    top: `${(rect.y / rows) * 100}%`,
    width: `${(rect.width / cols) * 100}%`,
    height: `${(rect.height / rows) * 100}%`,
  }
}
