import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { acceptPendingInvites, getCurrentUser, onAuthChange, type AppUser } from './auth'

interface AuthState {
  /** `undefined` mientras se comprueba la sesión. */
  user: AppUser | null | undefined
}

const AuthContext = createContext<AuthState>({ user: undefined })

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AppUser | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const handle = async (next: AppUser | null) => {
      // Al entrar, las invitaciones pendientes se convierten en jardines compartidos.
      if (next) await acceptPendingInvites().catch(() => undefined)
      if (!active) return
      setUser(next)
      queryClient.clear()
    }
    void getCurrentUser().then(handle)
    const unsubscribe = onAuthChange((next) => void handle(next))
    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
