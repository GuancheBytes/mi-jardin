import type { ReactNode } from 'react'

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p role="status" className="py-8 text-center text-stone-500">
      {label}
    </p>
  )
}

export function ErrorMessage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Algo ha fallado'
  return (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
      {message}
    </p>
  )
}

export function EmptyState({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="py-10 text-center text-stone-500">
      <div aria-hidden className="mb-2 text-4xl">
        {icon}
      </div>
      {children}
    </div>
  )
}
