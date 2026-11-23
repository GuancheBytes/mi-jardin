import { SPECIES_CATALOG } from '@/data/catalog'
import { makePlant } from '@/test/fixtures'
import { fromPlant, fromZone, toCompanionRule, toPlant, toSpecies, toZone } from './mappers'

describe('mappers de Supabase', () => {
  it('convierte una planta ida y vuelta', () => {
    const { id, ...plant } = makePlant({ nickname: 'Pepa', photoUrl: 'https://x/y.jpg' })
    expect(toPlant({ id, ...fromPlant(plant) })).toEqual({ id, ...plant })
  })

  it('convierte una zona ida y vuelta', () => {
    const zone = { gardenId: 'g1', name: 'Bancal', kind: 'bancal' as const, x: 1, y: 2, width: 3, height: 4 }
    expect(toZone({ id: 'z1', ...fromZone(zone) })).toEqual({ id: 'z1', ...zone })
  })

  it('convierte especies del formato de la tabla', () => {
    const tomate = SPECIES_CATALOG.find((s) => s.id === 'tomate')!
    expect(
      toSpecies({
        id: tomate.id,
        name: tomate.name,
        scientific_name: tomate.scientificName,
        emoji: tomate.emoji,
        category: tomate.category,
        care_riego: tomate.care.riego,
        care_poda: tomate.care.poda,
        care_abonado: tomate.care.abonado,
        planting_templado: tomate.plantingMonths.templado,
        planting_subtropical: tomate.plantingMonths.subtropical,
      }),
    ).toEqual(tomate)
  })

  it('omite la nota vacía de una asociación', () => {
    expect(toCompanionRule({ species_a: 'a', species_b: 'b', kind: 'compatible', note: null })).toEqual({
      speciesA: 'a',
      speciesB: 'b',
      kind: 'compatible',
    })
  })
})

describe('catálogo semilla', () => {
  it('tiene 25 especies con ids únicos y meses válidos', () => {
    expect(SPECIES_CATALOG).toHaveLength(25)
    expect(new Set(SPECIES_CATALOG.map((s) => s.id)).size).toBe(25)
    for (const s of SPECIES_CATALOG) {
      for (const m of [...s.plantingMonths.templado, ...s.plantingMonths.subtropical]) {
        expect(m).toBeGreaterThanOrEqual(1)
        expect(m).toBeLessThanOrEqual(12)
      }
    }
  })
})
