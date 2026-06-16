import PatientForm from '@/components/PatientForm'
import { createPatient } from '../actions'
import { getDoctorProfile } from '@/lib/doctor-profile'
import Link from 'next/link'

export default async function NuevoExpedientePage() {
  const profile = await getDoctorProfile()

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/pacientes" className="text-teal text-sm font-semibold hover:underline">
          ← Pacientes
        </Link>
        <h2 className="text-lg font-extrabold text-navy">Nuevo expediente</h2>
      </div>
      <PatientForm
        action={createPatient}
        catDx={profile?.cat_dx ?? []}
        catTx={profile?.cat_tx ?? []}
        catEst={profile?.cat_est ?? []}
        catPosologia={profile?.cat_posologia ?? {}}
        consultorios={profile?.consultorios ?? {}}
      />
    </>
  )
}
