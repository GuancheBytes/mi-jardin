import { useState, type FormEvent } from 'react'
import { sendMagicLink } from '@/data/auth'
import { Button, Card, Field, inputClass } from '@/ui'

/** Acceso con enlace mágico: sin contraseñas. */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      await sendMagicLink(email)
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace')
      setState('error')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <div aria-hidden className="text-5xl">
          🌿
        </div>
        <h1 className="mt-2 text-2xl font-bold text-leaf-800">Mi Jardín</h1>
        <p className="text-stone-600">Tu huerto y tu jardín, al día.</p>
      </div>

      <Card>
        {state === 'sent' ? (
          <div role="status" className="space-y-2 text-center">
            <p className="text-3xl" aria-hidden>
              📬
            </p>
            <p className="font-medium">Revisa tu correo</p>
            <p className="text-sm text-stone-600">
              Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo en este dispositivo para entrar.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setState('idle')}>
              Usar otro email
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <Field label="Email">
              <input
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </Field>
            {state === 'error' && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={state === 'sending'}>
              {state === 'sending' ? 'Enviando…' : 'Enviarme un enlace para entrar'}
            </Button>
            <p className="text-center text-xs text-stone-500">
              Si alguien te ha invitado a su jardín, entra con el mismo email y lo verás.
            </p>
          </form>
        )}
      </Card>
    </div>
  )
}
