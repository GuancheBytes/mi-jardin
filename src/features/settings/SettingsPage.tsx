import { useState } from 'react'
import { isSupabaseConfigured } from '@/data'
import { useCurrentGarden } from '@/data/currentGarden'
import { MembersCard } from '@/features/sharing/MembersCard'
import { NewGardenForm } from '@/features/sharing/NewGardenForm'
import { Button, ErrorMessage, Loading, Modal } from '@/ui'
import { AccountCard } from './AccountCard'
import { GardenSettingsCard } from './GardenSettingsCard'

export function SettingsPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  const [creating, setCreating] = useState(false)
  const demo = !isSupabaseConfigured

  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ajustes</h1>
        <Button variant="secondary" size="sm" onClick={() => setCreating(true)}>
          + Nuevo jardín
        </Button>
      </div>
      <GardenSettingsCard key={garden.id} garden={garden} />
      <MembersCard garden={garden} demo={demo} />
      <AccountCard demo={demo} />

      <Modal open={creating} title="Nuevo jardín" onClose={() => setCreating(false)}>
        <NewGardenForm onDone={() => setCreating(false)} />
      </Modal>
    </div>
  )
}
