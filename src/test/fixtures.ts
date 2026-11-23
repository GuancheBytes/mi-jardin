import type { CareTask, CompanionRule, Plant, Species } from '@/domain'

export function makeSpecies(overrides: Partial<Species> = {}): Species {
  return {
    id: 'tomate',
    name: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    emoji: '🍅',
    category: 'hortaliza',
    care: { riego: 2, poda: 14, abonado: 30 },
    plantingMonths: { templado: [3, 4, 5], subtropical: [1, 2, 9, 10, 11] },
    ...overrides,
  }
}

export function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: 'p1',
    gardenId: 'g1',
    speciesId: 'tomate',
    nickname: null,
    plantedOn: '2026-01-01',
    photoUrl: null,
    notes: '',
    x: 0,
    y: 0,
    ...overrides,
  }
}

export function makeTask(overrides: Partial<CareTask> = {}): CareTask {
  return {
    id: 't1',
    gardenId: 'g1',
    plantId: 'p1',
    kind: 'riego',
    doneOn: '2026-01-05',
    doneBy: null,
    ...overrides,
  }
}

export const RULES: CompanionRule[] = [
  { speciesA: 'tomate', speciesB: 'albahaca', kind: 'compatible', note: 'Mejora el sabor' },
  { speciesA: 'patata', speciesB: 'tomate', kind: 'incompatible' },
]
