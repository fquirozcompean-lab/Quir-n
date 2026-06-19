import { createClient } from '@/lib/supabase/server'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { calcAge, formatDate } from '@/lib/utils'
import DocumentHeader from '@/components/print/DocumentHeader'
import ClinicalNote from '@/components/print/ClinicalNote'
import PrintButton from '@/components/print/PrintButton'

export const metadata = { title: 'Exportar expedientes a PDF — Quirón' }

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-500">{label}: </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

export default async function ExportarImprimirPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getDoctorProfile()

  let patientsQuery = supabase
    .from('patients')
    .select('*')
    .eq('user_id', user!.id)
    .eq('archived', false)
    .order('nombre', { ascending: true })

  if (ids && ids !== 'all') {
    patientsQuery = patientsQuery.in('id', ids.split(','))
  }

  const { data: patients } = await patientsQuery
  const patientIds = (patients ?? []).map(p => p.id)

  const [{ data: allConsultations }, { data: allPrescriptions }] = await Promise.all([
    patientIds.length
      ? supabase.from('consultations').select('*').in('patient_id', patientIds).eq('user_id', user!.id).order('fecha', { ascending: true })
      : Promise.resolve({ data: [] }),
    patientIds.length
      ? supabase.from('prescriptions').select('token, fecha, patient_id, created_at').in('patient_id', patientIds).eq('user_id', user!.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const consultsByPatient = (allConsultations ?? []).reduce<Record<string, typeof allConsultations>>((acc, c) => {
    (acc[c.patient_id] ??= []).push(c)
    return acc
  }, {})
  const rxByPatient = (allPrescriptions ?? []).reduce<Record<string, typeof allPrescriptions>>((acc, rx) => {
    (acc[rx.patient_id] ??= []).push(rx)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <p className="text-sm text-muted">{patients?.length ?? 0} expediente{(patients?.length ?? 0) !== 1 ? 's' : ''} a exportar</p>
        <PrintButton label="Imprimir / Guardar PDF" />
      </div>

      {(patients ?? []).map((patient, idx) => {
        const consultorioLabel = patient.consultorio && profile?.consultorios?.[patient.consultorio]
          ? profile.consultorios[patient.consultorio].hospital
          : patient.consultorio
        const consultas = consultsByPatient[patient.id] ?? []
        const recetas = rxByPatient[patient.id] ?? []

        return (
          <div key={patient.id} className={idx > 0 ? 'break-before-page pt-2' : ''}>
            <DocumentHeader profile={profile} patientName={patient.nombre} subtitle="Expediente clínico completo" />

            <div className="border border-gray-300 rounded-lg p-4 mb-4 break-inside-avoid">
              <h3 className="text-sm font-bold text-navy mb-2 pb-2 border-b border-gray-200">Datos generales</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <Info label="Edad" value={calcAge(patient.fecha_nacimiento)} />
                <Info label="Sexo" value={patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : null} />
                <Info label="Fecha de nacimiento" value={formatDate(patient.fecha_nacimiento)} />
                <Info label="Ciudad" value={patient.ciudad} />
                <Info label="Teléfono" value={patient.telefono} />
                <Info label="Consultorio" value={consultorioLabel} />
              </div>
              {(patient.cronicos || patient.quirurgicos || patient.alergicos || patient.medicamentos) && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  <Info label="Crónicos" value={patient.cronicos} />
                  <Info label="Quirúrgicos" value={patient.quirurgicos} />
                  <Info label="Alérgicos" value={patient.alergicos} />
                  <Info label="Medicamentos de uso crónico" value={patient.medicamentos} />
                </div>
              )}
            </div>

            <ClinicalNote
              title="Historia clínica inicial"
              note={{
                fecha: patient.fecha_consulta,
                hora: patient.hora_consulta,
                consultorioLabel,
                padecimiento: patient.padecimiento,
                exploracion: patient.exploracion,
                analisis: patient.analisis,
                dx: patient.dx,
                dx_texto: patient.dx_texto,
                tx: patient.tx,
                tx_texto: patient.tx_texto,
                estudios_solicitados: patient.estudios_solicitados,
                pronostico: patient.pronostico,
                signos_vitales: patient.signos_vitales,
              }}
            />

            {consultas.map(c => {
              const cLabel = c.consultorio && profile?.consultorios?.[c.consultorio]
                ? profile.consultorios[c.consultorio].hospital
                : c.consultorio
              return (
                <ClinicalNote
                  key={c.id}
                  title="Consulta de seguimiento"
                  note={{
                    fecha: c.fecha,
                    hora: c.hora,
                    motivo: c.motivo,
                    consultorioLabel: cLabel,
                    padecimiento: c.padecimiento,
                    exploracion: c.exploracion,
                    analisis: c.analisis,
                    dx: c.dx,
                    dx_texto: c.dx_texto,
                    tx: c.tx,
                    tx_texto: c.tx_texto,
                    estudios_solicitados: c.estudios_solicitados,
                    pronostico: c.pronostico,
                    signos_vitales: c.signos_vitales,
                  }}
                />
              )
            })}

            {recetas.length > 0 && (
              <div className="border border-gray-300 rounded-lg p-4 mb-4 break-inside-avoid">
                <h3 className="text-sm font-bold text-navy mb-2 pb-2 border-b border-gray-200">Recetas generadas</h3>
                <ul className="space-y-1">
                  {recetas.map(rx => (
                    <li key={rx.token} className="text-sm text-gray-800 flex items-center justify-between gap-2">
                      <span>{formatDate(rx.fecha)}</span>
                      <span className="text-xs text-gray-500">/receta/{rx.token}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}

      {(!patients || patients.length === 0) && (
        <p className="text-sm text-muted">No hay expedientes para exportar.</p>
      )}
    </div>
  )
}
