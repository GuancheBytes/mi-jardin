import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** `true` si hay credenciales en el entorno. Si no, la app funciona en modo demo. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/** Cliente de Supabase, o `null` en modo demo. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true, detectSessionInUrl: true } })
  : null

export const PHOTO_BUCKET = 'plant-photos'
