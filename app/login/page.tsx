'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { loginAction } from './actions'

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === '1'
  const linkExpired = searchParams.get('error') === 'link_expirado'

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-navy">Quirón</h1>
        <p className="text-muted text-sm mt-1">Expedientes clínicos para tu consultorio</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-navy mb-5">Iniciar sesión</h2>

        {resetSuccess && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
            Contraseña actualizada. Ya puedes iniciar sesión.
          </p>
        )}

        {linkExpired && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            El link expiró. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".
          </p>
        )}

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
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-xs text-muted">
                Contraseña
              </label>
              <Link href="/forgot-password" className="text-xs text-teal hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
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
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="text-teal font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
