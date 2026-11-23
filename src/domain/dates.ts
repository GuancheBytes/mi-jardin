import type { ISODate } from './types'

const MS_PER_DAY = 86_400_000
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Convierte `YYYY-MM-DD` a milisegundos UTC. Lanza un error si el formato no es válido. */
function toUtcMs(date: ISODate): number {
  const match = ISO_RE.exec(date)
  if (!match) throw new Error(`Fecha no válida: "${date}"`)
  const [, y, m, d] = match
  const ms = Date.UTC(Number(y), Number(m) - 1, Number(d))
  if (toISODate(new Date(ms)) !== date) throw new Error(`Fecha no válida: "${date}"`)
  return ms
}

/** Fecha de calendario (en UTC) de un `Date`. */
export function toISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

/** Fecha local de hoy, para usar como "hoy" en la UI. */
export function todayISO(now: Date = new Date()): ISODate {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: ISODate, days: number): ISODate {
  return toISODate(new Date(toUtcMs(date) + days * MS_PER_DAY))
}

/** Días que van de `from` a `to` (positivo si `to` es posterior). */
export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY)
}

/** Mes (1-12) de una fecha. */
export function monthOf(date: ISODate): number {
  toUtcMs(date)
  return Number(date.slice(5, 7))
}

export function maxDate(a: ISODate, b: ISODate): ISODate {
  return diffDays(a, b) > 0 ? b : a
}
