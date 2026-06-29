import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultationForm from '@/components/ConsultationForm'
import { updateConsultationAction } from '@/app/(app)/pacientes/[id]/nueva-consulta/actions'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { calcAge } from '@/lib/utils'

export default async function EditConsultaPage({
  params,
}: {
  params: Promise<{ id: string; consultaId: string }>
}) {
  const { id, consultaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: consulta }, { data: rawAttachments }, profile] = await Promise.all([
    supabase
      .from('patients')
      .select('nombre, consultorio, fecha_nacimiento, sexo, ciudad, cronicos, quirurgicos, alergicos, medicamentos, padecimiento, exploracion, analisis, dx, dx_texto, tx, tx_texto')
      .eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('consultations').select('*').eq('id', consultaId).eq('user_id', user!.id).single(),
    supabase.from('attachments').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    getDoctorProfile(),
  ])

  const initialAttachments = await Promise.all(
    (rawAttachments ?? []).map(async (att) => {
      const { data } = await supabase.storage.from('estudios').createSignedUrl(att.storage_path, 3600)
      return { id: att.id, nombre_archivo: att.nombre_archivo, tipo: att.tipo, url: data?.signedUrl ?? '' }
    })
  )

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
        historiaClinica={{
          edad: calcAge(patient.fecha_nacimiento),
          sexo: patient.sexo,
          ciudad: patient.ciudad,
          cronicos: patient.cronicos,
          quirurgicos: patient.quirurgicos,
          alergicos: patient.alergicos,
          medicamentos: patient.medicamentos,
          padecimiento: patient.padecimiento,
          exploracion: patient.exploracion,
          analisis: patient.analisis,
          dx: patient.dx,
          dx_texto: patient.dx_texto,
          tx: patient.tx,
          tx_texto: patient.tx_texto,
        }}
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
        initialAttachments={initialAttachments}
      />
    </div>
  )
}
