import type { CareTask, CompanionRule, Garden, GardenMember, Plant, Species, Zone } from '@/domain'

/*
 * Conversión entre filas de Postgres (snake_case) y tipos del dominio (camelCase).
 * Mantenerlo aquí evita que el resto de la app conozca la forma de las tablas.
 */

export interface SpeciesRow {
  id: string
  name: string
  scientific_name: string
  emoji: string
  category: Species['category']
  care_riego: number | null
  care_poda: number | null
  care_abonado: number | null
  planting_templado: number[]
  planting_subtropical: number[]
}

export const toSpecies = (r: SpeciesRow): Species => ({
  id: r.id,
  name: r.name,
  scientificName: r.scientific_name,
  emoji: r.emoji,
  category: r.category,
  care: { riego: r.care_riego, poda: r.care_poda, abonado: r.care_abonado },
  plantingMonths: { templado: r.planting_templado, subtropical: r.planting_subtropical },
})

export interface CompanionRuleRow {
  species_a: string
  species_b: string
  kind: CompanionRule['kind']
  note: string | null
}

export const toCompanionRule = (r: CompanionRuleRow): CompanionRule =>
  r.note
    ? { speciesA: r.species_a, speciesB: r.species_b, kind: r.kind, note: r.note }
    : { speciesA: r.species_a, speciesB: r.species_b, kind: r.kind }

export interface GardenRow {
  id: string
  name: string
  cols: number
  rows: number
  climate: Garden['climate']
}

export const toGarden = (r: GardenRow): Garden => ({
  id: r.id,
  name: r.name,
  cols: r.cols,
  rows: r.rows,
  climate: r.climate,
})

export interface ZoneRow {
  id: string
  garden_id: string
  name: string
  kind: Zone['kind']
  x: number
  y: number
  width: number
  height: number
}

export const toZone = (r: ZoneRow): Zone => ({
  id: r.id,
  gardenId: r.garden_id,
  name: r.name,
  kind: r.kind,
  x: r.x,
  y: r.y,
  width: r.width,
  height: r.height,
})

export const fromZone = (z: Omit<Zone, 'id'>): Omit<ZoneRow, 'id'> => ({
  garden_id: z.gardenId,
  name: z.name,
  kind: z.kind,
  x: z.x,
  y: z.y,
  width: z.width,
  height: z.height,
})

export interface PlantRow {
  id: string
  garden_id: string
  species_id: string
  nickname: string | null
  planted_on: string
  photo_url: string | null
  notes: string
  x: number
  y: number
}

export const toPlant = (r: PlantRow): Plant => ({
  id: r.id,
  gardenId: r.garden_id,
  speciesId: r.species_id,
  nickname: r.nickname,
  plantedOn: r.planted_on,
  photoUrl: r.photo_url,
  notes: r.notes,
  x: r.x,
  y: r.y,
})

export const fromPlant = (p: Omit<Plant, 'id'>): Omit<PlantRow, 'id'> => ({
  garden_id: p.gardenId,
  species_id: p.speciesId,
  nickname: p.nickname,
  planted_on: p.plantedOn,
  photo_url: p.photoUrl,
  notes: p.notes,
  x: p.x,
  y: p.y,
})

export interface CareTaskRow {
  id: string
  garden_id: string
  plant_id: string
  kind: CareTask['kind']
  done_on: string
  done_by: string | null
}

export const toCareTask = (r: CareTaskRow): CareTask => ({
  id: r.id,
  gardenId: r.garden_id,
  plantId: r.plant_id,
  kind: r.kind,
  doneOn: r.done_on,
  doneBy: r.done_by,
})

export interface MemberRow {
  garden_id: string
  user_id: string
  email: string
  role: 'owner' | 'member'
}

export const toMember = (r: MemberRow): GardenMember => ({
  gardenId: r.garden_id,
  userId: r.user_id,
  email: r.email,
  role: r.role,
})
