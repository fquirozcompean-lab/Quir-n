import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PatientForm from '@/components/PatientForm'
import { updatePatient } from '../../actions'
import { getDoctorProfile } from '@/lib/doctor-profile'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, profile] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).eq('user_id', user!.id).single(),
    getDoctorProfile(),
  ])

  if (!patient) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/pacientes/${id}`} className="text-teal text-sm font-semibold hover:underline">
          ← Cancelar
        </Link>
        <h2 className="text-lg font-extrabold text-navy">Editar expediente</h2>
      </div>
      <PatientForm
        initialData={patient}
        action={updatePatient}
        cancelHref={`/pacientes/${id}`}
        catDx={profile?.cat_dx ?? []}
        catTx={profile?.cat_tx ?? []}
        catEst={profile?.cat_est ?? []}
        catPosologia={profile?.cat_posologia ?? {}}
        consultorios={profile?.consultorios ?? {}}
      />
    </>
  )
}
