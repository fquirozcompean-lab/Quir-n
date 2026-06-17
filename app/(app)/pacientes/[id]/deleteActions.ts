'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function archivePatient(patientId: string): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('patients')
    .update({ archived: true })
    .eq('id', patientId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  redirect('/pacientes')
}
