'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from './actions'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy">Quirón</h1>
          <p className="text-muted text-sm mt-1">Expedientes clínicos para tu consultorio</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          {state?.needsConfirmation ? (
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-navy">Revisa tu correo</h2>
              <p className="text-sm text-muted">
                Te enviamos un link de confirmación. Ábrelo para activar tu cuenta y luego inicia sesión.
              </p>
              <Link href="/login" className="inline-block text-teal font-semibold text-sm hover:underline mt-2">
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-navy mb-1">Crear cuenta</h2>
              <p className="text-xs text-muted mb-5">14 días de prueba gratis, sin tarjeta.</p>

              <form action={action} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs text-muted mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs text-muted mb-1">
                    Contraseña
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
                  {pending ? 'Creando cuenta…' : 'Crear cuenta'}
                </button>
              </form>
            </>
          )}
        </div>

        {!state?.needsConfirmation && (
          <p className="text-center text-sm text-muted mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-teal font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
