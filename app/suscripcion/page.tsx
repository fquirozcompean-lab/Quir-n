import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureDoctorProfile, getDoctorProfile } from '@/lib/doctor-profile'
import { createCheckoutSession, createBillingPortalSession } from './actions'
import { logoutAction } from '@/app/login/actions'

const STATUS_LABEL: Record<string, string> = {
  trialing: 'En periodo de prueba',
  active: 'Activa',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  incomplete: 'Incompleta',
  none: 'Sin iniciar',
}

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureDoctorProfile(user.id)
  const profile = await getDoctorProfile()

  const status = profile?.subscription_status ?? 'none'
  const trialEnds = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const isActive = status === 'active'

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-navy">Quirón</h1>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-navy">Tu suscripción</h2>
          <p className="text-sm text-muted">
            Estado: <span className="font-semibold text-navy">{STATUS_LABEL[status]}</span>
          </p>
          {status === 'trialing' && trialEnds && (
            <p className="text-sm text-muted">
              Tu prueba gratuita termina el {trialEnds.toLocaleDateString('es-MX')}.
            </p>
          )}
          {status === 'past_due' && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Hubo un problema con tu último pago. Actualiza tu método de pago para seguir usando Quirón.
            </p>
          )}

          {!isActive && (
            <form action={createCheckoutSession}>
              <button type="submit" className="w-full bg-navy text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-teal transition-colors">
                Suscribirse
              </button>
            </form>
          )}

          {profile?.stripe_customer_id && (
            <form action={createBillingPortalSession}>
              <button type="submit" className="w-full bg-teal-light text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-border transition-colors">
                Gestionar suscripción
              </button>
            </form>
          )}

          <form action={logoutAction}>
            <button type="submit" className="w-full text-xs text-muted hover:underline">Cerrar sesión</button>
          </form>
        </div>
      </div>
    </div>
  )
}
