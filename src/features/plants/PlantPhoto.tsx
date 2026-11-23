import { useRef, useState } from 'react'
import type { Plant, Species } from '@/domain'
import { repository } from '@/data'
import { Button } from '@/ui'
import { resizeImage } from './resizeImage'

interface PlantPhotoProps {
  plant: Plant
  species: Species | undefined
  onChange: (photoUrl: string | null) => void
}

export function PlantPhoto({ plant, species, onChange }: PlantPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const blob = await resizeImage(file)
      onChange(await repository.uploadPhoto(plant.gardenId, plant.id, blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-leaf-50">
        {plant.photoUrl ? (
          <img src={plant.photoUrl} alt={`Foto de ${plant.nickname ?? species?.name ?? 'la planta'}`} className="size-full object-cover" />
        ) : (
          <span aria-hidden className="text-7xl">
            {species?.emoji ?? '🌱'}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          📷 {busy ? 'Subiendo…' : plant.photoUrl ? 'Cambiar foto' : 'Añadir foto'}
        </Button>
        {plant.photoUrl && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Quitar
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
