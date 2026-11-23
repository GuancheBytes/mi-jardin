import { createLocalRepository } from './localRepository'
import type { GardenRepository } from './repository'

/**
 * Punto único de acceso a datos. Si hay credenciales de Supabase en el entorno
 * se usa Supabase; si no, el modo demo con localStorage.
 */
export const repository: GardenRepository = createLocalRepository()

export type { GardenRepository } from './repository'
