import { todayISO, type CareTask, type GardenMember } from '@/domain'
import { COMPANION_RULES, SPECIES_CATALOG } from './catalog'
import type { GardenRepository } from './repository'
import { createDemoData, type DemoData } from './seed/demoGarden'

const STORAGE_KEY = 'mi-jardin:demo:v1'
const DEMO_USER: GardenMember = {
  gardenId: '',
  userId: 'demo-user',
  email: 'tu@ejemplo.com',
  role: 'owner',
}

interface Store extends DemoData {
  members: GardenMember[]
}

function newId(): string {
  return crypto.randomUUID()
}

function readFile(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Repositorio del modo demo: todo vive en localStorage del navegador.
 * La primera vez se rellena con un jardín de ejemplo.
 */
export function createLocalRepository(storage: Storage = localStorage): GardenRepository {
  function load(): Store {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Store
    const demo = createDemoData(todayISO())
    const store: Store = {
      ...demo,
      members: demo.gardens.map((g) => ({ ...DEMO_USER, gardenId: g.id })),
    }
    save(store)
    return store
  }

  function save(store: Store) {
    storage.setItem(STORAGE_KEY, JSON.stringify(store))
  }

  /** Lee, aplica un cambio y guarda. Devuelve lo que devuelva `fn`. */
  async function mutate<T>(fn: (store: Store) => T): Promise<T> {
    const store = load()
    const result = fn(store)
    save(store)
    return result
  }

  function replaceById<T extends { id: string }>(list: T[], item: T): T {
    const index = list.findIndex((i) => i.id === item.id)
    if (index === -1) throw new Error('No encontrado')
    list[index] = item
    return item
  }

  return {
    mode: 'demo',

    listSpecies: async () => SPECIES_CATALOG,
    listCompanionRules: async () => COMPANION_RULES,

    listGardens: async () => load().gardens,
    createGarden: (input) =>
      mutate((s) => {
        const garden = { ...input, id: newId() }
        s.gardens.push(garden)
        s.members.push({ ...DEMO_USER, gardenId: garden.id })
        return garden
      }),
    updateGarden: (garden) => mutate((s) => replaceById(s.gardens, garden)),

    listZones: async (gardenId) => load().zones.filter((z) => z.gardenId === gardenId),
    createZone: (input) =>
      mutate((s) => {
        const zone = { ...input, id: newId() }
        s.zones.push(zone)
        return zone
      }),
    updateZone: (zone) => mutate((s) => replaceById(s.zones, zone)),
    deleteZone: (id) =>
      mutate((s) => {
        s.zones = s.zones.filter((z) => z.id !== id)
      }),

    listPlants: async (gardenId) => load().plants.filter((p) => p.gardenId === gardenId),
    createPlant: (input) =>
      mutate((s) => {
        const plant = { ...input, id: newId() }
        s.plants.push(plant)
        return plant
      }),
    updatePlant: (plant) => mutate((s) => replaceById(s.plants, plant)),
    deletePlant: (id) =>
      mutate((s) => {
        s.plants = s.plants.filter((p) => p.id !== id)
        s.careTasks = s.careTasks.filter((t) => t.plantId !== id)
      }),
    // En modo demo la foto se guarda como data URL (ya reducida por la UI).
    uploadPhoto: (_gardenId, _plantId, file) => readFile(file),

    listCareTasks: async (gardenId) => load().careTasks.filter((t) => t.gardenId === gardenId),
    completeCareTask: (input) =>
      mutate((s) => {
        const task: CareTask = { ...input, id: newId(), doneBy: DEMO_USER.userId }
        s.careTasks.push(task)
        return task
      }),
    undoCareTask: (id) =>
      mutate((s) => {
        s.careTasks = s.careTasks.filter((t) => t.id !== id)
      }),

    listMembers: async (gardenId) => load().members.filter((m) => m.gardenId === gardenId),
    inviteMember: (gardenId, email) =>
      mutate((s) => {
        if (s.members.some((m) => m.gardenId === gardenId && m.email === email)) return
        s.members.push({ gardenId, userId: newId(), email, role: 'member' })
      }),
    removeMember: (gardenId, userId) =>
      mutate((s) => {
        s.members = s.members.filter((m) => !(m.gardenId === gardenId && m.userId === userId))
      }),
  }
}

/** Borra los datos de la demo; al recargar se vuelve a crear el jardín de ejemplo. */
export function resetDemoData(storage: Storage = localStorage) {
  storage.removeItem(STORAGE_KEY)
}
