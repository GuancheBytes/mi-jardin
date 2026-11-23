import { makePlant, RULES } from '@/test/fixtures'
import { companionsAt, companionsOfSpecies, findRule, summarizeCompanions } from './companions'

describe('findRule', () => {
  it('es simétrica', () => {
    expect(findRule(RULES, 'tomate', 'albahaca')?.kind).toBe('compatible')
    expect(findRule(RULES, 'albahaca', 'tomate')?.kind).toBe('compatible')
    expect(findRule(RULES, 'tomate', 'patata')?.kind).toBe('incompatible')
    expect(findRule(RULES, 'tomate', 'lechuga')).toBeUndefined()
  })
})

describe('companionsAt', () => {
  const plants = [
    makePlant({ id: 'albahaca1', speciesId: 'albahaca', x: 1, y: 1 }),
    makePlant({ id: 'patata1', speciesId: 'patata', x: 3, y: 3 }),
    makePlant({ id: 'lechuga1', speciesId: 'lechuga', x: 2, y: 1 }),
    makePlant({ id: 'yo', speciesId: 'albahaca', x: 2, y: 2 }),
  ]

  it('avisa de vecinas compatibles e incompatibles dentro del radio', () => {
    const matches = companionsAt({ x: 2, y: 2 }, 'tomate', plants, RULES, 'yo')
    expect(matches).toEqual([
      { plant: plants[0], kind: 'compatible', note: 'Mejora el sabor' },
      { plant: plants[1], kind: 'incompatible' },
    ])
    expect(summarizeCompanions(matches)).toEqual({ good: 1, bad: 1 })
  })

  it('ignora plantas fuera del radio y se excluye a sí misma', () => {
    expect(companionsAt({ x: 6, y: 6 }, 'tomate', plants, RULES)).toEqual([])
    expect(companionsAt({ x: 2, y: 2 }, 'tomate', plants, RULES, undefined, 0)).toHaveLength(1)
  })
})

describe('companionsOfSpecies', () => {
  it('lista compañeras en ambos sentidos', () => {
    expect(companionsOfSpecies(RULES, 'tomate')).toEqual({
      compatible: ['albahaca'],
      incompatible: ['patata'],
    })
    expect(companionsOfSpecies(RULES, 'albahaca')).toEqual({
      compatible: ['tomate'],
      incompatible: [],
    })
  })
})
