import { makeSpecies } from '@/test/fixtures'
import { canPlantIn, monthName, monthsUntilPlanting, whatToPlant } from './season'

const tomate = makeSpecies()
const albahaca = makeSpecies({
  id: 'albahaca',
  name: 'Albahaca',
  plantingMonths: { templado: [4, 5], subtropical: [2, 3, 4, 10] },
})
const nunca = makeSpecies({ id: 'nunca', plantingMonths: { templado: [], subtropical: [] } })

describe('season', () => {
  it('nombra los meses y valida el rango', () => {
    expect(monthName(1)).toBe('enero')
    expect(monthName(12)).toBe('diciembre')
    expect(() => monthName(13)).toThrow('Mes no válido')
    expect(() => monthName(0)).toThrow()
  })

  it('filtra por mes y clima y ordena por nombre', () => {
    expect(whatToPlant([tomate, albahaca], 10, 'subtropical').map((s) => s.id)).toEqual([
      'albahaca',
      'tomate',
    ])
    expect(whatToPlant([tomate, albahaca], 10, 'templado')).toEqual([])
    expect(() => whatToPlant([tomate], 0, 'templado')).toThrow()
  })

  it('comprueba si se puede plantar', () => {
    expect(canPlantIn(tomate, 4, 'templado')).toBe(true)
    expect(canPlantIn(tomate, 4, 'subtropical')).toBe(false)
  })

  it('calcula los meses hasta la próxima ventana, dando la vuelta al año', () => {
    expect(monthsUntilPlanting(tomate, 3, 'templado')).toBe(0)
    expect(monthsUntilPlanting(tomate, 6, 'templado')).toBe(9)
    expect(monthsUntilPlanting(nunca, 6, 'templado')).toBeNull()
  })
})
