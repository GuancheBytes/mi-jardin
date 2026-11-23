import { addDays, type CareTask, type Garden, type Plant, type Zone } from '@/domain'

export interface DemoData {
  gardens: Garden[]
  zones: Zone[]
  plants: Plant[]
  careTasks: CareTask[]
}

export const DEMO_GARDEN_ID = 'demo-garden'

/**
 * Jardín de ejemplo. Las fechas se calculan respecto a `today` para que
 * siempre haya tareas pendientes, atrasadas y al día al abrir la demo.
 */
export function createDemoData(today: string): DemoData {
  const g = DEMO_GARDEN_ID
  const ago = (days: number) => addDays(today, -days)

  const zones: Zone[] = [
    { id: 'z-bancal-1', gardenId: g, name: 'Bancal norte', kind: 'bancal', x: 0, y: 0, width: 5, height: 3 },
    { id: 'z-bancal-2', gardenId: g, name: 'Bancal sur', kind: 'bancal', x: 0, y: 5, width: 5, height: 3 },
    { id: 'z-macetas', gardenId: g, name: 'Macetas del patio', kind: 'maceta', x: 7, y: 0, width: 3, height: 2 },
    { id: 'z-arriate', gardenId: g, name: 'Arriate de flores', kind: 'arriate', x: 7, y: 4, width: 5, height: 2 },
    { id: 'z-cesped', gardenId: g, name: 'Césped', kind: 'cesped', x: 7, y: 6, width: 5, height: 2 },
  ]

  const plant = (
    id: string,
    speciesId: string,
    x: number,
    y: number,
    plantedDaysAgo: number,
    notes = '',
  ): Plant => ({
    id,
    gardenId: g,
    speciesId,
    nickname: null,
    plantedOn: ago(plantedDaysAgo),
    photoUrl: null,
    notes,
    x,
    y,
  })

  const plants: Plant[] = [
    plant('p-tomate-1', 'tomate', 1, 1, 40, 'Variedad Muchamiel. Entutorar cuando pase de 40 cm.'),
    plant('p-albahaca-1', 'albahaca', 2, 1, 35),
    plant('p-tomate-2', 'tomate', 3, 1, 40),
    plant('p-lechuga-1', 'lechuga', 1, 6, 20),
    plant('p-zanahoria-1', 'zanahoria', 2, 6, 25),
    plant('p-cebolla-1', 'cebolla', 3, 6, 25),
    plant('p-judia-1', 'judia', 4, 7, 15, 'Junto a la cebolla a propósito: para probar el aviso ⚠️'),
    plant('p-aloe-1', 'aloe', 7, 0, 300),
    plant('p-romero-1', 'romero', 8, 0, 200),
    plant('p-menta-1', 'menta', 9, 1, 90),
    plant('p-rosal-1', 'rosal', 8, 4, 400),
    plant('p-lavanda-1', 'lavanda', 9, 4, 380),
    plant('p-buganvilla-1', 'buganvilla', 11, 4, 700),
    plant('p-papaya-1', 'papaya', 11, 1, 500),
  ]

  const done = (id: string, plantId: string, kind: CareTask['kind'], daysAgo: number): CareTask => ({
    id,
    gardenId: g,
    plantId,
    kind,
    doneOn: ago(daysAgo),
    doneBy: null,
  })

  const careTasks: CareTask[] = [
    done('c1', 'p-tomate-1', 'riego', 1),
    done('c2', 'p-tomate-2', 'riego', 2),
    done('c3', 'p-albahaca-1', 'riego', 4),
    done('c4', 'p-lechuga-1', 'riego', 1),
    done('c5', 'p-aloe-1', 'riego', 5),
    done('c6', 'p-romero-1', 'riego', 10),
    done('c7', 'p-rosal-1', 'riego', 1),
    done('c8', 'p-rosal-1', 'poda', 20),
    done('c9', 'p-rosal-1', 'abonado', 40),
    done('c10', 'p-lavanda-1', 'riego', 3),
    done('c11', 'p-lavanda-1', 'poda', 100),
    done('c12', 'p-buganvilla-1', 'riego', 2),
    done('c13', 'p-buganvilla-1', 'poda', 30),
    done('c14', 'p-buganvilla-1', 'abonado', 10),
    done('c15', 'p-papaya-1', 'riego', 4),
    done('c16', 'p-papaya-1', 'abonado', 12),
    done('c17', 'p-menta-1', 'riego', 1),
    done('c18', 'p-menta-1', 'poda', 10),
    done('c19', 'p-menta-1', 'abonado', 20),
    done('c20', 'p-tomate-1', 'poda', 4),
    done('c21', 'p-tomate-1', 'abonado', 15),
    done('c22', 'p-romero-1', 'poda', 50),
    done('c23', 'p-tomate-2', 'poda', 3),
    done('c24', 'p-tomate-2', 'abonado', 5),
    done('c25', 'p-zanahoria-1', 'riego', 1),
    done('c26', 'p-cebolla-1', 'riego', 4),
    done('c27', 'p-albahaca-1', 'poda', 5),
    done('c28', 'p-albahaca-1', 'abonado', 10),
    done('c29', 'p-judia-1', 'riego', 3),
    done('c30', 'p-lechuga-1', 'abonado', 8),
  ]

  return {
    gardens: [{ id: g, name: 'Huerto de ejemplo', cols: 12, rows: 8, climate: 'subtropical' }],
    zones,
    plants,
    careTasks,
  }
}
