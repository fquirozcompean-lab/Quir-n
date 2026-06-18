import { notFound } from 'next/navigation'
import { getDoctorProfile } from '@/lib/doctor-profile'
import ProcedimientoClient from '@/components/ProcedimientoClient'

export default async function PostcuidadosStandalonePage() {
  const profile = await getDoctorProfile()
  if (!profile?.procedimiento?.postcuidados_mostrar) notFound()

  return (
    <ProcedimientoClient
      tipo="post"
      procedimientoLabel={profile.procedimiento.label}
      tituloHoja={profile.procedimiento.postcuidados_label ?? 'Cuidados post'}
      secciones={profile.procedimiento.postcuidados_secciones ?? []}
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
