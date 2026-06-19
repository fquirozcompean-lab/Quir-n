import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { calcAge, formatDate } from '@/lib/utils'
import DocumentHeader from '@/components/print/DocumentHeader'
import ClinicalNote from '@/components/print/ClinicalNote'
import PrintButton from '@/components/print/PrintButton'

export const metadata = { title: 'Imprimir expediente — Quirón' }

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-500">{label}: </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

export default async function ImprimirExpedientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { id } = await params
  const { nuevo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: consultations }, { data: prescriptions }, profile] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('consultations').select('*').eq('patient_id', id).eq('user_id', user!.id).order('fecha', { ascending: true }),
    supabase.from('prescriptions').select('token, fecha, created_at').eq('patient_id', id).eq('user_id', user!.id).order('created_at', { ascending: false }),
    getDoctorProfile(),
  ])

  if (!patient) notFound()

  const consultorioLabel = patient.consultorio && profile?.consultorios?.[patient.consultorio]
    ? profile.consultorios[patient.consultorio].hospital
    : patient.consultorio

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← {patient.nombre}
        </Link>
        <PrintButton label="Imprimir / Guardar expediente PDF" />
      </div>

      {nuevo === '1' && (
        <p className="print:hidden text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Historia clínica guardada. Puedes imprimirla o guardarla como PDF ahora mismo.
        </p>
      )}

      <DocumentHeader profile={profile} patientName={patient.nombre} subtitle="Expediente clínico completo" />

      {/* Datos generales */}
      <div className="border border-gray-300 rounded-lg p-4 mb-4 break-inside-avoid">
        <h3 className="text-sm font-bold text-navy mb-2 pb-2 border-b border-gray-200">Datos generales</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <Info label="Edad" value={calcAge(patient.fecha_nacimiento)} />
          <Info label="Sexo" value={patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : null} />
          <Info label="Fecha de nacimiento" value={formatDate(patient.fecha_nacimiento)} />
          <Info label="Ciudad" value={patient.ciudad} />
          <Info label="Teléfono" value={patient.telefono} />
          <Info label="Ocupación" value={patient.ocupacion} />
          <Info label="Estado civil" value={patient.estado_civil} />
          <Info label="Hemotipo" value={patient.hemotipo} />
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

      {/* Historia clínica inicial */}
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

      {/* Consultas de seguimiento */}
      {(consultations ?? []).map(c => {
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

      {/* Recetas generadas */}
      {prescriptions && prescriptions.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-4 mb-4 break-inside-avoid">
          <h3 className="text-sm font-bold text-navy mb-2 pb-2 border-b border-gray-200">Recetas generadas</h3>
          <ul className="space-y-1">
            {prescriptions.map(rx => (
              <li key={rx.token} className="text-sm text-gray-800 flex items-center justify-between gap-2">
                <span>{formatDate(rx.fecha)}</span>
                <a href={`/receta/${rx.token}`} className="text-teal text-xs hover:underline print:text-gray-500">
                  /receta/{rx.token}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
