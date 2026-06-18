import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureDoctorProfile, getDoctorProfile } from '@/lib/doctor-profile'
import { createCheckoutSession, createBillingPortalSession } from './actions'
import { logoutAction } from '@/app/login/actions'

function daysLeft(date: Date) {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000))
}

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureDoctorProfile(user.id)
  const profile = await getDoctorProfile()

  const status = profile?.subscription_status ?? 'none'
  const trialEnds = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const isActive = status === 'active'
  const isTrial = status === 'trialing'
  const trialDays = trialEnds ? daysLeft(trialEnds) : 0
  const trialExpired = isTrial && trialDays === 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md space-y-4">

        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-navy">Quirón</h1>
          <p className="text-sm text-muted mt-1">Expediente clínico digital</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 text-center font-semibold">
            ¡Suscripción activada! Bienvenido a Quirón.
          </div>
        )}

        {/* Estado actual */}
        {(isTrial || isActive || status === 'past_due') && (
          <div className="bg-card border border-border rounded-2xl p-4">
            {isTrial && !trialExpired && (
              <p className="text-sm text-navy">
                Tienes <span className="font-extrabold text-teal">{trialDays} día{trialDays !== 1 ? 's' : ''}</span> de prueba gratuita restantes.
              </p>
            )}
            {trialExpired && (
              <p className="text-sm text-red-600 font-semibold">Tu periodo de prueba ha terminado. Suscríbete para seguir usando Quirón.</p>
            )}
            {isActive && (
              <p className="text-sm text-navy">Tu suscripción está <span className="font-extrabold text-teal">activa</span>.</p>
            )}
            {status === 'past_due' && (
              <p className="text-sm text-red-600">Hay un problema con tu pago. Actualiza tu método de pago para continuar.</p>
            )}
          </div>
        )}

        {/* Planes */}
        {!isActive && (
          <div className="space-y-3">
            <p className="text-xs text-muted font-semibold text-center uppercase tracking-wide">Elige tu plan</p>

            <form action={createCheckoutSession}>
              <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ANNUAL ?? ''} />
              <button type="submit" className="w-full bg-navy text-white rounded-2xl p-4 text-left hover:bg-teal transition-colors group relative">
                <div className="absolute top-3 right-3 bg-teal text-white text-xs font-bold px-2 py-0.5 rounded-full">Mejor valor</div>
                <p className="font-extrabold text-base">Anual</p>
                <p className="text-2xl font-extrabold mt-1">$3,000 <span className="text-sm font-normal opacity-80">MXN / año</span></p>
                <p className="text-xs opacity-70 mt-1">$250/mes · Ahorras $600 vs mensual</p>
              </button>
            </form>

            <form action={createCheckoutSession}>
              <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_MONTHLY ?? ''} />
              <button type="submit" className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:border-teal transition-colors">
                <p className="font-extrabold text-base text-navy">Mensual</p>
                <p className="text-2xl font-extrabold text-navy mt-1">$300 <span className="text-sm font-normal text-muted">MXN / mes</span></p>
                <p className="text-xs text-muted mt-1">Sin compromiso, cancela cuando quieras</p>
              </button>
            </form>
          </div>
        )}

        {/* Portal de facturación */}
        {profile?.stripe_customer_id && (
          <form action={createBillingPortalSession}>
            <button type="submit" className="w-full bg-teal-light text-navy font-semibold text-sm py-2.5 rounded-xl hover:bg-border transition-colors">
              Gestionar suscripción / Facturas
            </button>
          </form>
        )}

        {isActive && (
          <a href="/pacientes" className="block w-full text-center bg-teal text-white font-semibold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            Ir a mis pacientes →
          </a>
        )}

        <form action={logoutAction}>
          <button type="submit" className="w-full text-xs text-muted hover:underline py-2">Cerrar sesión</button>
        </form>
      </div>
    </div>
  )
}
