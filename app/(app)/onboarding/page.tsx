import { getDoctorProfile } from '@/lib/doctor-profile'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export const metadata = { title: 'Bienvenido a Quirón' }

export default async function OnboardingPage() {
  const profile = await getDoctorProfile()
  if (!profile) redirect('/login')
  if (profile.onboarding_done) redirect('/pacientes')

  return (
    <div className="max-w-lg mx-auto py-6">
      <OnboardingWizard profile={profile} />
    </div>
  )
}
