import { diffDays, type ISODate, type Plant, type Species } from '@/domain'

export function plantName(plant: Plant, species: Species | undefined): string {
  return plant.nickname || species?.name || 'Planta'
}

export function formatDate(date: ISODate): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "hoy", "mañana", "hace 3 días", "en 5 días"… */
export function relativeDays(date: ISODate, today: ISODate): string {
  const days = diffDays(today, date)
  if (days === 0) return 'hoy'
  if (days === 1) return 'mañana'
  if (days === -1) return 'ayer'
  return days > 0 ? `en ${days} días` : `hace ${-days} días`
}

export function frequencyLabel(days: number | null): string {
  if (days === null || days <= 0) return 'No necesita'
  if (days === 1) return 'Cada día'
  if (days % 30 === 0) return days === 30 ? 'Cada mes' : `Cada ${days / 30} meses`
  if (days % 7 === 0) return days === 7 ? 'Cada semana' : `Cada ${days / 7} semanas`
  return `Cada ${days} días`
}
