import { getDoctorProfile } from '@/lib/doctor-profile'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export const metadata = { title: 'Tutorial — Quirón' }

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ tutorial?: string }>
}) {
  const { tutorial } = await searchParams
  const profile = await getDoctorProfile()
  if (!profile) redirect('/login')
  // Si ya completó onboarding y no viene del botón Tutorial, redirigir
  if (profile.onboarding_done && tutorial !== '1') redirect('/pacientes')

  return (
    <div className="max-w-lg mx-auto py-6">
      <OnboardingWizard profile={profile} isTutorial={tutorial === '1'} />
    </div>
  )
}
