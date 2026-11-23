import { addDays, diffDays, maxDate, monthOf, toISODate, todayISO } from './dates'

describe('dates', () => {
  it('suma días cruzando meses y años', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('no se ve afectado por el cambio de hora', () => {
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2)
  })

  it('calcula la diferencia en días con signo', () => {
    expect(diffDays('2026-01-01', '2026-01-11')).toBe(10)
    expect(diffDays('2026-01-11', '2026-01-01')).toBe(-10)
    expect(diffDays('2026-05-05', '2026-05-05')).toBe(0)
  })

  it('rechaza fechas mal formadas o inexistentes', () => {
    expect(() => addDays('01/02/2026', 1)).toThrow('Fecha no válida')
    expect(() => addDays('2026-02-30', 1)).toThrow('Fecha no válida')
  })

  it('obtiene el mes', () => {
    expect(monthOf('2026-11-23')).toBe(11)
    expect(() => monthOf('nope')).toThrow()
  })

  it('devuelve la fecha mayor', () => {
    expect(maxDate('2026-01-01', '2026-02-01')).toBe('2026-02-01')
    expect(maxDate('2026-03-01', '2026-02-01')).toBe('2026-03-01')
  })

  it('convierte Date a ISO (UTC) y a fecha local', () => {
    expect(toISODate(new Date(Date.UTC(2026, 10, 23, 12)))).toBe('2026-11-23')
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
