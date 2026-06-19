import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDoctorProfile } from '@/lib/doctor-profile'
import DocumentHeader from '@/components/print/DocumentHeader'
import ClinicalNote from '@/components/print/ClinicalNote'
import PrintButton from '@/components/print/PrintButton'

export const metadata = { title: 'Imprimir consulta — Quirón' }

export default async function ImprimirConsultaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; consultaId: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { id, consultaId } = await params
  const { nuevo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: consulta }, profile] = await Promise.all([
    supabase.from('patients').select('nombre').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('consultations').select('*').eq('id', consultaId).eq('user_id', user!.id).single(),
    getDoctorProfile(),
  ])

  if (!patient || !consulta) notFound()
  const consultorioLabel = consulta.consultorio && profile?.consultorios?.[consulta.consultorio]
    ? profile.consultorios[consulta.consultorio].hospital
    : consulta.consultorio

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← {patient.nombre}
        </Link>
        <PrintButton />
      </div>

      {nuevo === '1' && (
        <p className="print:hidden text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Consulta guardada. Puedes imprimirla o guardarla como PDF ahora mismo.
        </p>
      )}

      <DocumentHeader
        profile={profile}
        patientName={patient.nombre}
        subtitle="Nota de consulta de seguimiento"
      />

      <ClinicalNote
        title="Consulta de seguimiento"
        note={{
          fecha: consulta.fecha,
          hora: consulta.hora,
          motivo: consulta.motivo,
          consultorioLabel,
          padecimiento: consulta.padecimiento,
          exploracion: consulta.exploracion,
          analisis: consulta.analisis,
          dx: consulta.dx,
          dx_texto: consulta.dx_texto,
          tx: consulta.tx,
          tx_texto: consulta.tx_texto,
          estudios_solicitados: consulta.estudios_solicitados,
          pronostico: consulta.pronostico,
          signos_vitales: consulta.signos_vitales,
        }}
      />
    </div>
  )
}
