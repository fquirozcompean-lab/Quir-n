import PatientForm from '@/components/PatientForm'
import { createPatient } from '../actions'
import Link from 'next/link'

export default function NuevoExpedientePage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/pacientes" className="text-teal text-sm font-semibold hover:underline">
          ← Pacientes
        </Link>
        <h2 className="text-lg font-extrabold text-navy">Nuevo expediente</h2>
      </div>
      <PatientForm action={createPatient} />
    </>
  )
}
