import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200 ${className}`}
      {...props}
    />
  )
}
