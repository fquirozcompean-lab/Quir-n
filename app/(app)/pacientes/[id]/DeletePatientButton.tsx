'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deletePatient } from './deleteActions'

export default function DeletePatientButton({ patientId, email }: { patientId: string; email: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
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
      const result = await deletePatient(patientId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-red-500 font-semibold hover:text-red-700 hover:underline"
      >
        Eliminar expediente
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-extrabold text-red-600 mb-1">Eliminar expediente</h3>
            <p className="text-sm text-muted mb-4">
              Se eliminarán el expediente, todas sus consultas y archivos adjuntos.
              <strong className="text-navy"> Esta acción no se puede deshacer.</strong>
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
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                  className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {pending ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
