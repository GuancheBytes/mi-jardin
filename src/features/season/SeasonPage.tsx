import { useState } from 'react'
import { Link } from 'react-router'
import { monthName, MONTH_NAMES, monthOf, monthsUntilPlanting, todayISO, whatToPlant } from '@/domain'
import { useCurrentGarden } from '@/data/currentGarden'
import { useSpecies } from '@/data/hooks'
import { EmptyState, inputClass, Loading } from '@/ui'
import { CLIMATE_LABEL } from './climate'

const CATEGORY_LABEL = {
  hortaliza: 'Hortaliza',
  aromatica: 'Aromática',
  ornamental: 'Ornamental',
  frutal: 'Frutal',
  suculenta: 'Suculenta',
} as const

export function SeasonPage() {
  const { garden, isLoading } = useCurrentGarden()
  const { species } = useSpecies()
  const [month, setMonth] = useState(() => monthOf(todayISO()))

  if (isLoading || !garden) return <Loading />
  const climate = garden.climate
  const now = whatToPlant(species, month, climate)
  const nextMonth = (month % 12) + 1
  const soon = species
    .filter((s) => monthsUntilPlanting(s, nextMonth, climate) === 0 && !now.includes(s))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Qué plantar</h1>
      <p className="text-sm text-stone-600">
        Clima: <strong>{CLIMATE_LABEL[climate]}</strong>.{' '}
        <Link to="/ajustes" className="text-leaf-700 underline">
          Cambiar
        </Link>
      </p>

      <label className="block">
        <span className="sr-only">Mes</span>
        <select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>
              {name[0]!.toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <section className="space-y-2">
        <h2 className="font-semibold">
          En {monthName(month)} ({now.length})
        </h2>
        {now.length === 0 ? (
          <EmptyState icon="❄️">No hay especies del catálogo para plantar este mes.</EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {now.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-stone-200">
                <span aria-hidden className="text-2xl">
                  {s.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-xs text-stone-500">{CATEGORY_LABEL[s.category]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {soon.length > 0 && (
        <section className="space-y-1">
          <h2 className="font-semibold text-stone-600">Prepara para {monthName(nextMonth)}</h2>
          <p className="text-sm text-stone-600">{soon.map((s) => `${s.emoji} ${s.name}`).join(' · ')}</p>
        </section>
      )}
    </div>
  )
}
