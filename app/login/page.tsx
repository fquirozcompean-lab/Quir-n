'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { DOCTOR } from '@/lib/doctor'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy">{DOCTOR.appName}</h1>
          <p className="text-muted text-sm mt-1">{DOCTOR.loginSubtitulo}</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-navy mb-5">Iniciar sesión</h2>

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
      </div>
    </div>
  )
}
