'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from './actions'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy">Quirón</h1>
          <p className="text-muted text-sm mt-1">Expedientes clínicos para tu consultorio</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-navy mb-1">Nueva contraseña</h2>
          <p className="text-xs text-muted mb-5">Elige una contraseña de al menos 6 caracteres.</p>

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs text-muted mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs text-muted mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-navy text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-teal transition-colors disabled:opacity-60"
            >
              {pending ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
