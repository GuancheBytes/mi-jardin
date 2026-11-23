import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-leaf-700 text-white hover:bg-leaf-800 disabled:bg-stone-300',
  secondary: 'bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-100',
  danger: 'bg-white text-red-700 ring-1 ring-red-300 hover:bg-red-50',
  ghost: 'text-stone-600 hover:bg-stone-100',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-sm' : 'px-4 py-2'
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed ${sizeClass} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
