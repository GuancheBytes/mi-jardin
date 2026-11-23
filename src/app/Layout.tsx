import { NavLink, Outlet } from 'react-router'
import { isSupabaseConfigured } from '@/data'
import { useCurrentGarden, useCurrentGardenStore } from '@/data/currentGarden'
import { useAuth } from '@/data/useAuth'
import { useGardenRealtime } from '@/data/useRealtime'
import { LoginPage } from '@/features/sharing/LoginPage'
import { NewGardenForm } from '@/features/sharing/NewGardenForm'
import { Card, ErrorMessage, Loading } from '@/ui'

const NAV_ITEMS = [
  { to: '/', label: 'Hoy', icon: '📋' },
  { to: '/mapa', label: 'Mapa', icon: '🗺️' },
  { to: '/plantas', label: 'Plantas', icon: '🌱' },
  { to: '/temporada', label: 'Temporada', icon: '📅' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
] as const

/** Decide qué mostrar: comprobando sesión, login, primer jardín o la app. */
export function Layout() {
  const { user } = useAuth()
  if (user === undefined) return <Loading label="Abriendo tu jardín…" />
  if (user === null) return <LoginPage />
  return <AppShell />
}

function AppShell() {
  const { garden, gardens, isLoading, error } = useCurrentGarden()
  useGardenRealtime(garden?.id)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <span className="text-lg font-bold text-leaf-800">🌿 Mi Jardín</span>
        <div className="flex min-w-0 items-center gap-2">
          {!isSupabaseConfigured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Demo</span>
          )}
          {gardens.length > 1 && <GardenSwitcher />}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        {error ? (
          <ErrorMessage error={error} />
        ) : isLoading ? (
          <Loading />
        ) : !garden ? (
          <Onboarding />
        ) : (
          <Outlet />
        )}
      </main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-xs ${
                    isActive ? 'font-semibold text-leaf-700' : 'text-stone-500'
                  }`
                }
              >
                <span aria-hidden className="text-lg">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function GardenSwitcher() {
  const { garden, gardens } = useCurrentGarden()
  const setGardenId = useCurrentGardenStore((s) => s.setGardenId)
  return (
    <select
      aria-label="Jardín"
      className="max-w-40 truncate rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm"
      value={garden?.id}
      onChange={(e) => setGardenId(e.target.value)}
    >
      {gardens.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}

function Onboarding() {
  return (
    <div className="mx-auto max-w-sm space-y-4 py-6">
      <div className="text-center">
        <div aria-hidden className="text-5xl">
          🌱
        </div>
        <h1 className="mt-2 text-xl font-semibold">Crea tu primer jardín</h1>
        <p className="text-stone-600">Después podrás dibujar zonas y colocar plantas en el mapa.</p>
      </div>
      <Card>
        <NewGardenForm />
      </Card>
    </div>
  )
}
