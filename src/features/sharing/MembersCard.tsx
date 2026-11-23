import { useState } from 'react'
import type { Garden } from '@/domain'
import { useMemberMutations, useMembers } from '@/data/hooks'
import { useAuth } from '@/data/useAuth'
import { Button, Card, inputClass } from '@/ui'

const ROLE_LABEL = { owner: 'Propietario', member: 'Miembro', invited: 'Invitación pendiente' } as const

/** Personas con acceso al jardín. Todas ven y completan las mismas tareas. */
export function MembersCard({ garden, demo }: { garden: Garden; demo: boolean }) {
  const { user } = useAuth()
  const members = useMembers(garden.id).data ?? []
  const { invite, remove } = useMemberMutations(garden.id)
  const [email, setEmail] = useState('')

  const isOwner = members.some((m) => m.userId === user?.id && m.role === 'owner')

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="font-semibold">Compartir jardín</h2>
        <p className="text-sm text-stone-600">
          Los miembros ven el mismo mapa y las mismas tareas. Cuando alguien marca un riego, le aparece hecho a todos.
        </p>
      </div>

      <ul className="divide-y divide-stone-100">
        {members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="truncate">
                {m.email}
                {m.userId === user?.id && <span className="text-stone-500"> (tú)</span>}
              </p>
              <p className={`text-xs ${m.role === 'invited' ? 'text-amber-700' : 'text-stone-500'}`}>{ROLE_LABEL[m.role]}</p>
            </div>
            {isOwner && m.role !== 'owner' && (
              <Button variant="ghost" size="sm" onClick={() => remove.mutate(m.userId)} aria-label={`Quitar a ${m.email}`}>
                Quitar
              </Button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            invite.mutate(email.trim().toLowerCase(), { onSuccess: () => setEmail('') })
          }}
        >
          <input
            type="email"
            required
            aria-label="Email de la persona a invitar"
            placeholder="familia@correo.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={invite.isPending}>
            Invitar
          </Button>
        </form>
      )}
      {invite.error && <p className="text-sm text-red-700">{invite.error.message}</p>}
      <p className="text-xs text-stone-500">
        {demo
          ? 'En modo demo las invitaciones quedan pendientes: conecta Supabase para compartir de verdad.'
          : 'Dile a esa persona que entre en la app con ese email; verá el jardín al iniciar sesión.'}
      </p>
    </Card>
  )
}
