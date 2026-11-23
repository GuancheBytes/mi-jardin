/**
 * Tipos del dominio. No dependen de React, Supabase ni del navegador.
 */

/** Fecha de calendario en formato `YYYY-MM-DD` (sin hora ni zona horaria). */
export type ISODate = string

export type Climate = 'templado' | 'subtropical'

export type CareKind = 'riego' | 'poda' | 'abonado'

export const CARE_KINDS: readonly CareKind[] = ['riego', 'poda', 'abonado']

export type SpeciesCategory = 'hortaliza' | 'aromatica' | 'ornamental' | 'frutal' | 'suculenta'

export interface Species {
  id: string
  name: string
  scientificName: string
  emoji: string
  category: SpeciesCategory
  /** Frecuencia de cada cuidado en días. `null` = ese cuidado no aplica. */
  care: Record<CareKind, number | null>
  /** Meses (1-12) en los que se puede plantar, según el clima. */
  plantingMonths: Record<Climate, number[]>
}

export type CompanionKind = 'compatible' | 'incompatible'

/** Regla de asociación entre dos especies. Es simétrica: A-B equivale a B-A. */
export interface CompanionRule {
  speciesA: string
  speciesB: string
  kind: CompanionKind
  note?: string
}

export interface Garden {
  id: string
  name: string
  cols: number
  rows: number
  climate: Climate
}

export type ZoneKind = 'bancal' | 'maceta' | 'cesped' | 'arriate' | 'otro'

export interface GridRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Zone extends GridRect {
  id: string
  gardenId: string
  name: string
  kind: ZoneKind
}

export interface GridPoint {
  x: number
  y: number
}

export interface Plant extends GridPoint {
  id: string
  gardenId: string
  speciesId: string
  nickname: string | null
  plantedOn: ISODate
  photoUrl: string | null
  notes: string
}

/** Registro de un cuidado ya realizado (tabla `care_tasks`). */
export interface CareTask {
  id: string
  gardenId: string
  plantId: string
  kind: CareKind
  doneOn: ISODate
  doneBy: string | null
}

export type MemberRole = 'owner' | 'member'

export interface GardenMember {
  gardenId: string
  userId: string
  email: string
  role: MemberRole
}

/** Estado de una tarea calculada respecto a "hoy". */
export type TaskStatus = 'atrasada' | 'hoy' | 'al-dia'

/** Tarea calculada a partir de la especie y el historial. No se guarda en base de datos. */
export interface DueTask {
  plantId: string
  kind: CareKind
  dueOn: ISODate
  status: TaskStatus
  /** Días de retraso (positivo) o que faltan (negativo). */
  daysLate: number
}

/** Estado visual de una planta en el mapa. */
export type PlantHealth = 'atrasada' | 'necesita-riego' | 'sana'
