import type { ZoneKind } from '@/domain'

export const ZONE_KINDS: { value: ZoneKind; label: string; className: string }[] = [
  { value: 'bancal', label: 'Bancal', className: 'bg-amber-700/15 ring-amber-700/40' },
  { value: 'maceta', label: 'Macetas', className: 'bg-orange-400/15 ring-orange-500/40' },
  { value: 'cesped', label: 'Césped', className: 'bg-green-400/25 ring-green-600/30' },
  { value: 'arriate', label: 'Arriate', className: 'bg-pink-300/20 ring-pink-500/40' },
  { value: 'otro', label: 'Otro', className: 'bg-stone-400/15 ring-stone-500/40' },
]

export function zoneClass(kind: ZoneKind): string {
  return ZONE_KINDS.find((k) => k.value === kind)?.className ?? ''
}
