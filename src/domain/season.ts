import type { Climate, Species } from './types'

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

export function monthName(month: number): string {
  const name = MONTH_NAMES[month - 1]
  if (!name) throw new Error(`Mes no válido: ${month}`)
  return name
}

export function canPlantIn(species: Species, month: number, climate: Climate): boolean {
  return species.plantingMonths[climate].includes(month)
}

/** Especies que se pueden plantar en un mes y clima, ordenadas por nombre. */
export function whatToPlant(species: Species[], month: number, climate: Climate): Species[] {
  monthName(month)
  return species
    .filter((s) => canPlantIn(s, month, climate))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

/** Meses que faltan hasta la próxima ventana de plantación (0 = este mes, `null` = nunca). */
export function monthsUntilPlanting(species: Species, month: number, climate: Climate): number | null {
  for (let offset = 0; offset < 12; offset++) {
    const m = ((month - 1 + offset) % 12) + 1
    if (canPlantIn(species, m, climate)) return offset
  }
  return null
}
