import { supabase } from './supabase/client'

export interface AppUser {
  id: string
  email: string
}

/** Usuario ficticio del modo demo. */
export const DEMO_USER: AppUser = { id: 'demo-user', email: 'tu@ejemplo.com' }

/** Usuario con sesión iniciada, o `null`. En modo demo siempre hay usuario. */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (!supabase) return DEMO_USER
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  return user ? { id: user.id, email: user.email ?? '' } : null
}

/** Escucha inicios y cierres de sesión. Devuelve la función para dejar de escuchar. */
export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
    callback(user ? { id: user.id, email: user.email ?? '' } : null)
  })
  return () => data.subscription.unsubscribe()
}

/** Envía un enlace mágico al email. Al pulsarlo se vuelve a la app con la sesión iniciada. */
export async function sendMagicLink(email: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    // BASE_URL es '/' en local y '/mi-jardin/' en GitHub Pages.
    options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href },
  })
  if (error) throw new Error(error.message)
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}

/** Convierte invitaciones pendientes a este email en membresías. */
export async function acceptPendingInvites(): Promise<void> {
  await supabase?.rpc('accept_garden_invites')
}
