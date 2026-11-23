import { makePlant, makeSpecies } from '@/test/fixtures'
import { formatDate, frequencyLabel, plantName, relativeDays } from './format'

describe('format', () => {
  it('usa el nombre propio, la especie o un genérico', () => {
    expect(plantName(makePlant({ nickname: 'Pepa' }), makeSpecies())).toBe('Pepa')
    expect(plantName(makePlant(), makeSpecies())).toBe('Tomate')
    expect(plantName(makePlant(), undefined)).toBe('Planta')
  })

  it('formatea fechas en español', () => {
    expect(formatDate('2026-11-23')).toMatch(/23.*nov.*2026/)
  })

  it('describe días relativos', () => {
    expect(relativeDays('2026-01-10', '2026-01-10')).toBe('hoy')
    expect(relativeDays('2026-01-11', '2026-01-10')).toBe('mañana')
    expect(relativeDays('2026-01-09', '2026-01-10')).toBe('ayer')
    expect(relativeDays('2026-01-15', '2026-01-10')).toBe('en 5 días')
    expect(relativeDays('2026-01-07', '2026-01-10')).toBe('hace 3 días')
  })

  it('describe frecuencias', () => {
    expect(frequencyLabel(null)).toBe('No necesita')
    expect(frequencyLabel(1)).toBe('Cada día')
    expect(frequencyLabel(3)).toBe('Cada 3 días')
    expect(frequencyLabel(7)).toBe('Cada semana')
    expect(frequencyLabel(14)).toBe('Cada 2 semanas')
    expect(frequencyLabel(30)).toBe('Cada mes')
    expect(frequencyLabel(90)).toBe('Cada 3 meses')
  })
})
