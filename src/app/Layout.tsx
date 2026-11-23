import { NavLink, Outlet } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: 'Hoy', icon: '📋' },
  { to: '/mapa', label: 'Mapa', icon: '🗺️' },
  { to: '/plantas', label: 'Plantas', icon: '🌱' },
  { to: '/temporada', label: 'Temporada', icon: '📅' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
] as const

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <span className="text-lg font-bold text-leaf-800">🌿 Mi Jardín</span>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
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
