import { useMapStore, type MapTool } from './mapStore'

const TOOLS: { value: MapTool; label: string; icon: string; help: string }[] = [
  { value: 'mover', label: 'Mover', icon: '✋', help: 'Arrastra plantas para moverlas. Toca una para ver su ficha.' },
  { value: 'planta', label: 'Plantar', icon: '🌱', help: 'Elige una especie y arrástrala al mapa (o tócala y luego toca una casilla).' },
  { value: 'zona', label: 'Zona', icon: '▭', help: 'Arrastra sobre la cuadrícula para dibujar un bancal, maceta o césped.' },
]

export function MapToolbar() {
  const tool = useMapStore((s) => s.tool)
  const setTool = useMapStore((s) => s.setTool)
  const current = TOOLS.find((t) => t.value === tool)

  return (
    <div className="space-y-2">
      <div role="radiogroup" aria-label="Herramienta" className="grid grid-cols-3 gap-1 rounded-xl bg-stone-200/70 p-1">
        {TOOLS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={tool === t.value}
            onClick={() => setTool(t.value)}
            className={`rounded-lg py-1.5 text-sm font-medium ${
              tool === t.value ? 'bg-white text-leaf-800 shadow' : 'text-stone-600'
            }`}
          >
            <span aria-hidden>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-stone-500">{current?.help}</p>
    </div>
  )
}
