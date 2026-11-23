import type {
  CareTask,
  Climate,
  CompanionRule,
  Garden,
  GardenMember,
  Plant,
  Species,
  Zone,
} from '@/domain'

export type NewGarden = { name: string; cols: number; rows: number; climate: Climate }
export type NewZone = Omit<Zone, 'id'>
export type NewPlant = Omit<Plant, 'id'>
export type NewCareTask = Omit<CareTask, 'id' | 'doneBy'>

/**
 * Contrato de acceso a datos. La UI solo conoce esta interfaz;
 * hay dos implementaciones: `LocalRepository` (modo demo) y `SupabaseRepository`.
 */
export interface GardenRepository {
  readonly mode: 'demo' | 'supabase'

  // Catálogo
  listSpecies(): Promise<Species[]>
  listCompanionRules(): Promise<CompanionRule[]>

  // Jardines
  listGardens(): Promise<Garden[]>
  createGarden(input: NewGarden): Promise<Garden>
  updateGarden(garden: Garden): Promise<Garden>

  // Zonas
  listZones(gardenId: string): Promise<Zone[]>
  createZone(input: NewZone): Promise<Zone>
  updateZone(zone: Zone): Promise<Zone>
  deleteZone(id: string): Promise<void>

  // Plantas
  listPlants(gardenId: string): Promise<Plant[]>
  createPlant(input: NewPlant): Promise<Plant>
  updatePlant(plant: Plant): Promise<Plant>
  deletePlant(id: string): Promise<void>
  uploadPhoto(gardenId: string, plantId: string, file: Blob): Promise<string>

  // Cuidados realizados
  listCareTasks(gardenId: string): Promise<CareTask[]>
  completeCareTask(input: NewCareTask): Promise<CareTask>
  undoCareTask(id: string): Promise<void>

  // Miembros
  listMembers(gardenId: string): Promise<GardenMember[]>
  inviteMember(gardenId: string, email: string): Promise<void>
  removeMember(gardenId: string, userId: string): Promise<void>
}
