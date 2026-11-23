import { useState } from 'react'
import { todayISO, type Species, type Zone } from '@/domain'
import { Button, Field, inputClass } from '@/ui'

export interface PlantFormValues {
  speciesId: string
  nickname: string
  plantedOn: string
  notes: string
  /** Solo al crear: zona donde colocarla ('' = cualquier sitio libre). */
  zoneId: string
}

interface PlantFormProps {
  species: Species[]
  zones?: Zone[]
  initial?: Partial<PlantFormValues>
  submitLabel: string
  onSubmit: (values: PlantFormValues) => void
  onCancel: () => void
}

export function PlantForm({ species, zones, initial, submitLabel, onSubmit, onCancel }: PlantFormProps) {
  const [values, setValues] = useState<PlantFormValues>({
    speciesId: initial?.speciesId ?? species[0]?.id ?? '',
    nickname: initial?.nickname ?? '',
    plantedOn: initial?.plantedOn ?? todayISO(),
    notes: initial?.notes ?? '',
    zoneId: initial?.zoneId ?? '',
  })
  const set = <K extends keyof PlantFormValues>(key: K, value: PlantFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      <Field label="Especie">
        <select className={inputClass} value={values.speciesId} onChange={(e) => set('speciesId', e.target.value)} required>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nombre propio (opcional)">
        <input className={inputClass} value={values.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="Tomatera de la abuela" />
      </Field>
      <Field label="Fecha de plantación">
        <input type="date" className={inputClass} value={values.plantedOn} max={todayISO()} onChange={(e) => set('plantedOn', e.target.value)} required />
      </Field>
      {zones && (
        <Field label="Dónde">
          <select className={inputClass} value={values.zoneId} onChange={(e) => set('zoneId', e.target.value)}>
            <option value="">Primer hueco libre del jardín</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Notas">
        <textarea className={inputClass} rows={3} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
