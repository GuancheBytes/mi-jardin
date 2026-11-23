import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './Button'

/** Aviso de la PWA: lista para usar sin conexión o con una versión nueva disponible. */
export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      <span>{needRefresh ? 'Hay una versión nueva de Mi Jardín.' : 'Lista para usar sin conexión.'}</span>
      <div className="flex gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => void updateServiceWorker(true)}>
            Actualizar
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-stone-300 hover:bg-stone-800" onClick={close}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
