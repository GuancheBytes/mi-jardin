import { companionsAt, companionsOfSpecies, type Plant } from '@/domain'
import { useCompanionRules, usePlants, useSpecies } from '@/data/hooks'
import { Card } from '@/ui'
import { CompanionNotice } from './CompanionNotice'

/** Para la ficha: vecinas actuales en el mapa y especies que le van bien o mal. */
export function CompanionsCard({ plant }: { plant: Plant }) {
  const rules = useCompanionRules().data ?? []
  const plants = usePlants(plant.gardenId).data ?? []
  const { byId } = useSpecies()

  const matches = companionsAt(plant, plant.speciesId, plants, rules, plant.id)
  const bySpecies = companionsOfSpecies(rules, plant.speciesId)
  const names = (ids: string[]) =>
    ids.map((id) => `${byId.get(id)?.emoji ?? ''} ${byId.get(id)?.name ?? id}`).join(', ')

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Plantas compañeras</h2>
      <CompanionNotice title="Vecinas en el mapa" matches={matches} speciesById={byId} />
      <dl className="space-y-1 text-sm">
        {bySpecies.compatible.length > 0 && (
          <div>
            <dt className="inline font-medium">✅ Le van bien: </dt>
            <dd className="inline text-stone-600">{names(bySpecies.compatible)}</dd>
          </div>
        )}
        {bySpecies.incompatible.length > 0 && (
          <div>
            <dt className="inline font-medium">⚠️ Mejor lejos de: </dt>
            <dd className="inline text-stone-600">{names(bySpecies.incompatible)}</dd>
          </div>
        )}
      </dl>
    </Card>
  )
}
