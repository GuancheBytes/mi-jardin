import { useState } from 'react'
import type { Climate, Garden } from '@/domain'
import { usePlants, useUpdateGarden, useZones } from '@/data/hooks'
import { CLIMATE_LABEL } from '@/features/season/climate'
import { Button, Card, Field, inputClass } from '@/ui'

const MIN_SIZE = 4
const MAX_SIZE = 30

/** Nombre, tamaño de la cuadrícula y clima del jardín. */
export function GardenSettingsCard({ garden }: { garden: Garden }) {
  const update = useUpdateGarden()
  const plants = usePlants(garden.id).data ?? []
  const zones = useZones(garden.id).data ?? []
  const [form, setForm] = useState(garden)
  const [saved, setSaved] = useState(false)

  // No se puede encoger la cuadrícula por debajo de lo que ya está ocupado.
  const minCols = Math.max(MIN_SIZE, ...plants.map((p) => p.x + 1), ...zones.map((z) => z.x + z.width))
  const minRows = Math.max(MIN_SIZE, ...plants.map((p) => p.y + 1), ...zones.map((z) => z.y + z.height))
  const clamp = (n: number, min: number) => Math.min(MAX_SIZE, Math.max(min, Math.round(n) || min))
  const change = (patch: Partial<Garden>) => {
    setSaved(false)
    setForm((f) => ({ ...f, ...patch }))
  }

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          update.mutate(
            {
              ...form,
              name: form.name.trim() || garden.name,
              cols: clamp(form.cols, minCols),
              rows: clamp(form.rows, minRows),
            },
            { onSuccess: () => setSaved(true) },
          )
        }}
      >
        <h2 className="font-semibold">Jardín</h2>
        <Field label="Nombre">
          <input className={inputClass} value={form.name} onChange={(e) => change({ name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Columnas">
            <input type="number" min={minCols} max={MAX_SIZE} className={inputClass} value={form.cols} onChange={(e) => change({ cols: Number(e.target.value) })} />
          </Field>
          <Field label="Filas">
            <input type="number" min={minRows} max={MAX_SIZE} className={inputClass} value={form.rows} onChange={(e) => change({ rows: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Clima">
          <select className={inputClass} value={form.climate} onChange={(e) => change({ climate: e.target.value as Climate })}>
            {(Object.keys(CLIMATE_LABEL) as Climate[]).map((c) => (
              <option key={c} value={c}>
                {CLIMATE_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-leaf-700">Guardado ✓</span>}
          <Button type="submit" disabled={update.isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  )
}
