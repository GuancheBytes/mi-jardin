import { createLocalRepository } from './localRepository'
import type { GardenRepository } from './repository'
import { supabase } from './supabase/client'
import { createSupabaseRepository } from './supabase/supabaseRepository'

/**
 * Punto único de acceso a datos. Si hay credenciales de Supabase en el entorno
 * se usa Supabase; si no, el modo demo con localStorage.
 */
export const repository: GardenRepository = supabase
  ? createSupabaseRepository(supabase)
  : createLocalRepository()

export { isSupabaseConfigured } from './supabase/client'
export type { GardenRepository } from './repository'
