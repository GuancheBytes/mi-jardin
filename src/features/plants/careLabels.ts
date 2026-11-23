import type { CareKind } from '@/domain'

export const CARE_LABELS: Record<CareKind, { label: string; verb: string; icon: string }> = {
  riego: { label: 'Riego', verb: 'Regar', icon: '💧' },
  poda: { label: 'Poda', verb: 'Podar', icon: '✂️' },
  abonado: { label: 'Abonado', verb: 'Abonar', icon: '🧪' },
}
