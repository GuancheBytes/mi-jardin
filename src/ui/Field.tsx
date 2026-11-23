import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-leaf-600 focus:ring-2 focus:ring-leaf-100 focus:outline-none'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  )
}
