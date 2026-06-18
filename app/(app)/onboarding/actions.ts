'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveWizardProfile(data: {
  nombre: string
  nombre_corto: string
  especialidad: string
  especialidades: string
  cedula_prof: string
  cedula_esp: string
  celular: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('doctor_profiles')
    .update(data)
    .eq('user_id', user.id)

  if (error) return { error: 'No se pudo guardar. Intenta de nuevo.' }
  return { ok: true }
}

export async function saveWizardConsultorio(data: {
  hospital: string
  ciudad: string
  telefono: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('doctor_profiles')
    .select('consultorios')
    .eq('user_id', user.id)
    .single()

  const consultorios = (profile?.consultorios ?? {}) as Record<string, object>
  consultorios['principal'] = {
    hospital: data.hospital,
    ciudad: data.ciudad,
    telefono: data.telefono,
    consultorio: '',
    estado: '',
  }

  const { error } = await supabase
    .from('doctor_profiles')
    .update({ consultorios })
    .eq('user_id', user.id)

  if (error) return { error: 'No se pudo guardar. Intenta de nuevo.' }
  return { ok: true }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('doctor_profiles')
    .update({ onboarding_done: true })
    .eq('user_id', user.id)
}
