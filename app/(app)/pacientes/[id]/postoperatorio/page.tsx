import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getDoctorProfile } from '@/lib/doctor-profile'
import ProcedimientoClient from '@/components/ProcedimientoClient'

export default async function PostoperatorioPage({
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

  if (!patient || !profile?.procedimiento?.postquirurgico_mostrar) notFound()

  return (
    <ProcedimientoClient
      tipo="post"
      procedimientoLabel={profile.procedimiento.label}
      tituloHoja={profile.procedimiento.postquirurgico_label ?? 'Instrucciones postquirúrgicas'}
      secciones={profile.procedimiento.postquirurgico_secciones ?? []}
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
