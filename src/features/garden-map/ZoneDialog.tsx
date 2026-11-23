import { useState } from 'react'
import type { ZoneKind } from '@/domain'
import { Button, Field, inputClass, Modal } from '@/ui'
import { ZONE_KINDS } from './zoneStyles'

export interface ZoneFormValues {
  name: string
  kind: ZoneKind
}

interface ZoneDialogProps {
  open: boolean
  initial?: ZoneFormValues
  onSave: (values: ZoneFormValues) => void
  onDelete?: () => void
  onClose: () => void
}

export function ZoneDialog({ open, initial, onSave, onDelete, onClose }: ZoneDialogProps) {
  return (
    <Modal open={open} title={onDelete ? 'Editar zona' : 'Nueva zona'} onClose={onClose}>
      {/* `key` reinicia el formulario cada vez que se abre con otros valores. */}
      <ZoneForm key={JSON.stringify(initial)} initial={initial} onSave={onSave} onDelete={onDelete} onClose={onClose} />
    </Modal>
  )
}

function ZoneForm({ initial, onSave, onDelete, onClose }: Omit<ZoneDialogProps, 'open'>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<ZoneKind>(initial?.kind ?? 'bancal')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ name: name.trim() || ZONE_KINDS.find((k) => k.value === kind)!.label, kind })
      }}
    >
      <Field label="Nombre">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bancal de tomates" autoFocus />
      </Field>
      <Field label="Tipo">
        <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as ZoneKind)}>
          {ZONE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex justify-between gap-2">
        {onDelete ? (
          <Button variant="danger" onClick={onDelete}>
            Borrar zona
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </div>
    </form>
  )
}
