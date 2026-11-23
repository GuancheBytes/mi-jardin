import { useCurrentGarden } from '@/data/currentGarden'
import { ErrorMessage, Loading } from '@/ui'
import { GardenSettingsCard } from './GardenSettingsCard'

export function SettingsPage() {
  const { garden, isLoading, error } = useCurrentGarden()
  if (error) return <ErrorMessage error={error} />
  if (isLoading || !garden) return <Loading />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ajustes</h1>
      <GardenSettingsCard key={garden.id} garden={garden} />
    </div>
  )
}
