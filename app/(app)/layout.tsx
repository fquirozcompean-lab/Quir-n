import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import AppNav from '@/components/AppNav'
import { ensureDoctorProfile, getDoctorProfile } from '@/lib/doctor-profile'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await ensureDoctorProfile(user.id)
  const profile = await getDoctorProfile()

  const devEmails = (process.env.DEVELOPER_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  const isDev = user.email ? devEmails.includes(user.email) : false

  const trialExpired = profile?.subscription_status === 'trialing' &&
    profile?.trial_ends_at != null &&
    new Date(profile.trial_ends_at) < new Date()

  if (!isDev && (!profile || !['trialing', 'active'].includes(profile.subscription_status) || trialExpired)) {
    redirect('/suscripcion')
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  if (!profile?.onboarding_done && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav nombreCorto={profile?.nombre_corto || ''} procedimiento={profile?.procedimiento ?? null} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  )
}
