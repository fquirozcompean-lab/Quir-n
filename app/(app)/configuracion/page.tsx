import { getDoctorProfile } from '@/lib/doctor-profile'
import { redirect } from 'next/navigation'
import ConfiguracionForm from './ConfiguracionForm'

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const { onboarding } = await searchParams
  const profile = await getDoctorProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-3 pb-10">
      <h2 className="text-lg font-extrabold text-navy">Configuración</h2>
      <ConfiguracionForm profile={profile} showOnboarding={onboarding === '1' || !profile.onboarding_done} />
    </div>
  )
}
