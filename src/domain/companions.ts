import { chebyshev } from './grid'
import type { CompanionKind, CompanionRule, GridPoint, Plant } from './types'

/** Radio (en celdas) en el que dos plantas se consideran vecinas. */
export const NEIGHBOR_RADIUS = 1

/** Busca la regla entre dos especies, en cualquier orden. */
export function findRule(
  rules: CompanionRule[],
  speciesA: string,
  speciesB: string,
): CompanionRule | undefined {
  return rules.find(
    (r) =>
      (r.speciesA === speciesA && r.speciesB === speciesB) ||
      (r.speciesA === speciesB && r.speciesB === speciesA),
  )
}

export interface CompanionMatch {
  plant: Plant
  kind: CompanionKind
  note?: string
}

/**
 * Vecinas con regla de asociación si colocamos `speciesId` en `position`.
 * `excludePlantId` evita compararse consigo misma al mover una planta ya colocada.
 */
export function companionsAt(
  position: GridPoint,
  speciesId: string,
  plants: Plant[],
  rules: CompanionRule[],
  excludePlantId?: string,
  radius: number = NEIGHBOR_RADIUS,
): CompanionMatch[] {
  const matches: CompanionMatch[] = []
  for (const plant of plants) {
    if (plant.id === excludePlantId) continue
    if (chebyshev(position, plant) > radius) continue
    const rule = findRule(rules, speciesId, plant.speciesId)
    if (!rule) continue
    matches.push(rule.note ? { plant, kind: rule.kind, note: rule.note } : { plant, kind: rule.kind })
  }
  return matches
}

export function summarizeCompanions(matches: CompanionMatch[]): { good: number; bad: number } {
  let good = 0
  let bad = 0
  for (const m of matches) {
    if (m.kind === 'compatible') good++
    else bad++
  }
  return { good, bad }
}

/** Especies compatibles e incompatibles con una dada, según las reglas. */
export function companionsOfSpecies(
  rules: CompanionRule[],
  speciesId: string,
): Record<CompanionKind, string[]> {
  const result: Record<CompanionKind, string[]> = { compatible: [], incompatible: [] }
  for (const r of rules) {
    if (r.speciesA === speciesId) result[r.kind].push(r.speciesB)
    else if (r.speciesB === speciesId) result[r.kind].push(r.speciesA)
  }
  return result
}
