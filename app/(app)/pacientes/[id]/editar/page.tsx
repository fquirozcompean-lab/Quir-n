import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PatientForm from '@/components/PatientForm'
import { updatePatient } from '../../actions'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!patient) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← Cancelar
        </Link>
        <h2 className="text-lg font-extrabold text-navy">Editar expediente</h2>
      </div>
      <PatientForm initialData={patient} action={updatePatient} cancelHref={`/pacientes/${id}`} />
    </>
  )
}
