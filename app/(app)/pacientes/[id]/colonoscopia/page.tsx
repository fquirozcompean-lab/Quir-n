import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DOCTOR } from '@/lib/doctor'
import ColonoscopyClient from './ColonoscopyClient'

export default async function ColonoscopyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from('patients')
    .select('nombre, sexo, telefono')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!patient) notFound()

  return (
    <ColonoscopyClient
      patientId={id}
      patientName={patient.nombre}
      patientPhone={patient.telefono}
      doctor={DOCTOR}
    />
  )
}
