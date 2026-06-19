import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultationForm from '@/components/ConsultationForm'
import { updateConsultationAction } from '@/app/(app)/pacientes/[id]/nueva-consulta/actions'
import { getDoctorProfile } from '@/lib/doctor-profile'

export default async function EditConsultaPage({
  params,
}: {
  params: Promise<{ id: string; consultaId: string }>
}) {
  const { id, consultaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: consulta }, profile] = await Promise.all([
    supabase.from('patients').select('nombre, consultorio').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('consultations').select('*').eq('id', consultaId).eq('user_id', user!.id).single(),
    getDoctorProfile(),
  ])

  if (!patient || !consulta) notFound()

  const boundAction = updateConsultationAction.bind(null, consultaId)

  return (
    <div className="space-y-3 pb-10">
      <div>
        <a href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← {patient.nombre}
        </a>
      </div>
      <h2 className="text-lg font-extrabold text-navy">Editar consulta</h2>
      <ConsultationForm
        patientId={id}
        patientName={patient.nombre}
        defaultConsultorio={patient.consultorio}
        action={boundAction}
        isEdit
        catDx={profile?.cat_dx ?? []}
        catTx={profile?.cat_tx ?? []}
        catEst={profile?.cat_est ?? []}
        consultorios={profile?.consultorios ?? {}}
        initialData={{
          fecha:              consulta.fecha,
          hora:               consulta.hora,
          consultorio:        consulta.consultorio,
          motivo:             consulta.motivo,
          padecimiento:       consulta.padecimiento,
          exploracion:        consulta.exploracion,
          analisis:           consulta.analisis,
          dx:                 consulta.dx ?? [],
          dx_texto:           consulta.dx_texto,
          tx:                 consulta.tx ?? [],
          tx_texto:           consulta.tx_texto,
          estudios_solicitados: consulta.estudios_solicitados ?? [],
          pronostico:         consulta.pronostico,
          signos_vitales:     consulta.signos_vitales,
        }}
      />
    </div>
  )
}
