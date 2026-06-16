import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ConsultationForm from '@/components/ConsultationForm'
import { saveConsultationAction } from './actions'
import { getDoctorProfile } from '@/lib/doctor-profile'

export default async function NuevaConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, profile] = await Promise.all([
    supabase.from('patients').select('id, nombre, consultorio').eq('id', id).eq('user_id', user!.id).single(),
    getDoctorProfile(),
  ])

  if (!patient) notFound()

  return (
    <div className="space-y-3 pb-10">
      <div className="flex items-center gap-2 mb-1">
        <Link href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← {patient.nombre}
        </Link>
      </div>
      <h2 className="text-lg font-extrabold text-navy">Nueva consulta de seguimiento</h2>
      <ConsultationForm
        patientId={id}
        patientName={patient.nombre}
        defaultConsultorio={patient.consultorio ?? undefined}
        action={saveConsultationAction}
        catDx={profile?.cat_dx ?? []}
        catTx={profile?.cat_tx ?? []}
        catEst={profile?.cat_est ?? []}
        consultorios={profile?.consultorios ?? {}}
      />
    </div>
  )
}
