import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getDoctorProfile } from '@/lib/doctor-profile'
import ColonoscopyClient from './ColonoscopyClient'

export default async function ColonoscopyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, profile] = await Promise.all([
    supabase.from('patients').select('nombre, sexo, telefono').eq('id', id).eq('user_id', user!.id).single(),
    getDoctorProfile(),
  ])

  if (!patient || !profile?.procedimiento?.mostrar) notFound()

  return (
    <ColonoscopyClient
      patientId={id}
      patientName={patient.nombre}
      patientPhone={patient.telefono}
      doctorNombre={profile.nombre}
      cedulaProf={profile.cedula_prof}
      cedulaEsp={profile.cedula_esp}
      emergencias={profile.emergencias}
      logoUrl={profile.logo_url}
      firmaUrl={profile.firma_url}
    />
  )
}
