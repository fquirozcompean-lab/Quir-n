import { notFound } from 'next/navigation'
import { getDoctorProfile } from '@/lib/doctor-profile'
import ColonoscopyClient from '@/app/(app)/pacientes/[id]/colonoscopia/ColonoscopyClient'

export default async function ColonoscopyStandalonePage() {
  const profile = await getDoctorProfile()
  if (!profile?.procedimiento?.mostrar) notFound()

  return (
    <ColonoscopyClient
      patientId={null}
      patientName={null}
      patientPhone={null}
      doctorNombre={profile.nombre}
      cedulaProf={profile.cedula_prof}
      cedulaEsp={profile.cedula_esp}
      emergencias={profile.emergencias}
      logoUrl={profile.logo_url}
      firmaUrl={profile.firma_url}
    />
  )
}
