import type { CompanionRule, Species } from '@/domain'
import companionsJson from './seed/companions.json'
import speciesJson from './seed/species.json'

/** Catálogo semilla de especies. Es el mismo que se inserta en Supabase con la migración de semilla. */
export const SPECIES_CATALOG = speciesJson as Species[]

export const COMPANION_RULES = companionsJson as CompanionRule[]
