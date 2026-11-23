import { useState } from 'react'
import type { Climate } from '@/domain'
import { useCurrentGardenStore } from '@/data/currentGarden'
import { useCreateGarden } from '@/data/hooks'
import { CLIMATE_LABEL } from '@/features/season/climate'
import { Button, Field, inputClass } from '@/ui'

/** Crea un jardín nuevo y lo deja abierto. */
export function NewGardenForm({ onDone }: { onDone?: () => void }) {
  const create = useCreateGarden()
  const setGardenId = useCurrentGardenStore((s) => s.setGardenId)
  const [name, setName] = useState('Mi jardín')
  const [climate, setClimate] = useState<Climate>('subtropical')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        create.mutate(
          { name: name.trim() || 'Mi jardín', cols: 12, rows: 8, climate },
          {
            onSuccess: (garden) => {
              setGardenId(garden.id)
              onDone?.()
            },
          },
        )
      }}
    >
      <Field label="Nombre del jardín">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Clima">
        <select className={inputClass} value={climate} onChange={(e) => setClimate(e.target.value as Climate)}>
          {(Object.keys(CLIMATE_LABEL) as Climate[]).map((c) => (
            <option key={c} value={c}>
              {CLIMATE_LABEL[c]}
            </option>
          ))}
        </select>
      </Field>
      <p className="text-xs text-stone-500">Empieza con una cuadrícula de 12 × 8; puedes cambiarla en Ajustes.</p>
      {create.error && (
        <p role="alert" className="text-sm text-red-700">
          {create.error.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        Crear jardín
      </Button>
    </form>
  )
}
