import { useState } from 'react'
import { signOut } from '@/data/auth'
import { resetDemoData } from '@/data/localRepository'
import { useAuth } from '@/data/useAuth'
import { Button, Card, Modal } from '@/ui'

export function AccountCard({ demo }: { demo: boolean }) {
  const { user } = useAuth()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Cuenta</h2>
      {demo ? (
        <>
          <p className="text-sm text-stone-600">
            Estás en <strong>modo demo</strong>: los datos se guardan solo en este navegador. Consulta el README para
            conectar Supabase.
          </p>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Restablecer jardín de ejemplo
          </Button>
          <Modal open={confirmReset} title="¿Restablecer la demo?" onClose={() => setConfirmReset(false)}>
            <p className="mb-4 text-stone-600">Se borrarán todos tus cambios y volverá el jardín de ejemplo.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetDemoData()
                  window.location.assign('/')
                }}
              >
                Restablecer
              </Button>
            </div>
          </Modal>
        </>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm">{user?.email}</p>
          <Button variant="secondary" size="sm" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </div>
      )}
    </Card>
  )
}
