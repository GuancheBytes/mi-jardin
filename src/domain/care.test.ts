import { makePlant, makeSpecies, makeTask } from '@/test/fixtures'
import {
  computeTasks,
  lastDone,
  nextDueDate,
  plantHealth,
  taskStatus,
  tasksForToday,
} from './care'
import type { DueTask, Species } from './types'

const tomate = makeSpecies()
const aloe = makeSpecies({ id: 'aloe', care: { riego: 14, poda: null, abonado: 0 } })
const speciesById = new Map<string, Species>([
  [tomate.id, tomate],
  [aloe.id, aloe],
])

describe('lastDone', () => {
  it('devuelve el cuidado más reciente de esa planta y tipo', () => {
    const history = [
      makeTask({ id: 'a', doneOn: '2026-01-10' }),
      makeTask({ id: 'b', doneOn: '2026-01-20' }),
      makeTask({ id: 'c', doneOn: '2026-01-15' }),
      makeTask({ id: 'd', doneOn: '2026-02-01', kind: 'poda' }),
      makeTask({ id: 'e', doneOn: '2026-02-01', plantId: 'otra' }),
    ]
    expect(lastDone('p1', 'riego', history)).toBe('2026-01-20')
  })

  it('devuelve null si nunca se hizo', () => {
    expect(lastDone('p1', 'riego', [])).toBeNull()
  })
})

describe('nextDueDate', () => {
  const plant = makePlant({ plantedOn: '2026-01-01' })

  it('cuenta desde la plantación si no hay historial', () => {
    expect(nextDueDate(plant, tomate, 'riego', [])).toBe('2026-01-03')
  })

  it('cuenta desde el último cuidado', () => {
    expect(nextDueDate(plant, tomate, 'riego', [makeTask({ doneOn: '2026-01-10' })])).toBe(
      '2026-01-12',
    )
  })

  it('devuelve null si el cuidado no aplica o la frecuencia es 0', () => {
    expect(nextDueDate(plant, aloe, 'poda', [])).toBeNull()
    expect(nextDueDate(plant, aloe, 'abonado', [])).toBeNull()
  })
})

describe('taskStatus', () => {
  it('clasifica según hoy', () => {
    expect(taskStatus('2026-01-01', '2026-01-02')).toBe('atrasada')
    expect(taskStatus('2026-01-02', '2026-01-02')).toBe('hoy')
    expect(taskStatus('2026-01-03', '2026-01-02')).toBe('al-dia')
  })
})

describe('computeTasks', () => {
  it('genera una tarea por cuidado aplicable e ignora especies desconocidas', () => {
    const plants = [
      makePlant({ id: 'p1', speciesId: 'tomate' }),
      makePlant({ id: 'p2', speciesId: 'aloe' }),
      makePlant({ id: 'p3', speciesId: 'desconocida' }),
    ]
    const tasks = computeTasks(plants, speciesById, [], '2026-01-03')
    expect(tasks).toHaveLength(4)
    expect(tasks.find((t) => t.plantId === 'p1' && t.kind === 'riego')).toEqual({
      plantId: 'p1',
      kind: 'riego',
      dueOn: '2026-01-03',
      status: 'hoy',
      daysLate: 0,
    })
    expect(tasks.filter((t) => t.plantId === 'p2').map((t) => t.kind)).toEqual(['riego'])
  })
})

describe('tasksForToday', () => {
  it('quita las que están al día y ordena las más atrasadas primero', () => {
    const t = (plantId: string, kind: DueTask['kind'], daysLate: number): DueTask => ({
      plantId,
      kind,
      dueOn: '2026-01-01',
      status: daysLate > 0 ? 'atrasada' : daysLate === 0 ? 'hoy' : 'al-dia',
      daysLate,
    })
    const result = tasksForToday([
      t('a', 'abonado', 0),
      t('b', 'riego', 3),
      t('c', 'riego', -2),
      t('d', 'riego', 0),
      t('e', 'poda', 5),
    ])
    expect(result.map((r) => r.plantId)).toEqual(['e', 'b', 'd', 'a'])
  })
})

describe('plantHealth', () => {
  const base = { dueOn: '2026-01-01', daysLate: 0 }
  it('atrasada si alguna tarea está atrasada', () => {
    expect(
      plantHealth('p1', [
        { ...base, plantId: 'p1', kind: 'poda', status: 'atrasada' },
        { ...base, plantId: 'p1', kind: 'riego', status: 'hoy' },
      ]),
    ).toBe('atrasada')
  })

  it('necesita riego si el riego toca hoy', () => {
    expect(plantHealth('p1', [{ ...base, plantId: 'p1', kind: 'riego', status: 'hoy' }])).toBe(
      'necesita-riego',
    )
  })

  it('sana en otro caso, ignorando otras plantas', () => {
    expect(
      plantHealth('p1', [
        { ...base, plantId: 'p1', kind: 'abonado', status: 'hoy' },
        { ...base, plantId: 'p2', kind: 'riego', status: 'atrasada' },
      ]),
    ).toBe('sana')
  })
})
