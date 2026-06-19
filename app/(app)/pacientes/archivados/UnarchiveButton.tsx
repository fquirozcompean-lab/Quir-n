'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { unarchivePatient } from '../[id]/deleteActions'

export default function UnarchiveButton({ patientId, email }: { patientId: string; email: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setError(null)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setError(null)
    if (passwordRef.current) passwordRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const password = passwordRef.current?.value ?? ''

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Contraseña incorrecta')
      return
    }

    startTransition(async () => {
      const result = await unarchivePatient(patientId)
      if (result?.error) { setError(result.error); return }
      handleClose()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs bg-teal text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
      >
        ↺ Desarchivar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-extrabold text-navy mb-1">Desarchivar expediente</h3>
            <p className="text-sm text-muted mb-4">
              El expediente volverá a aparecer en la lista de pacientes activos.
              <br /><br />
              Ingresa tu contraseña para confirmar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={passwordRef}
                type="password"
                placeholder="Tu contraseña"
                autoFocus
                required
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={pending}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-teal-light text-navy hover:bg-border transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-teal text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {pending ? 'Restaurando…' : 'Sí, desarchivar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
