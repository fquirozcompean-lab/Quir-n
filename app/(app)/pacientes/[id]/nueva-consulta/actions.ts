'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveConsultationAction(
  _prev: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const patientId = formData.get('patient_id') as string

  const { data, error } = await supabase.from('consultations').insert({
    patient_id:           patientId,
    user_id:              user.id,
    fecha:                formData.get('fecha') as string,
    hora:                 formData.get('hora') as string || null,
    consultorio:          formData.get('consultorio') as string || null,
    motivo:               formData.get('motivo') as string || null,
    padecimiento:         formData.get('padecimiento') as string || null,
    exploracion:          formData.get('exploracion') as string || null,
    analisis:             formData.get('analisis') as string || null,
    dx:                   JSON.parse((formData.get('dx') as string) || '[]'),
    dx_texto:             formData.get('dx_texto') as string || null,
    tx:                   JSON.parse((formData.get('tx') as string) || '[]'),
    tx_texto:             formData.get('tx_texto') as string || null,
    estudios_solicitados: JSON.parse((formData.get('estudios_solicitados') as string) || '[]'),
    pronostico:           formData.get('pronostico') as string || null,
    signos_vitales: {
      ta:   (formData.get('sv_ta')   as string) || '120/80',
      fc:   (formData.get('sv_fc')   as string) || '72',
      fr:   (formData.get('sv_fr')   as string) || '16',
      temp: (formData.get('sv_temp') as string) || '36.5',
      spo2: (formData.get('sv_spo2') as string) || '98',
    },
  }).select('id').single()

  if (error || !data) return { error: error?.message ?? 'No se pudo guardar la consulta.' }
  redirect(`/pacientes/${patientId}/consulta/${data.id}/imprimir?nuevo=1`)
}

export async function updateConsultationAction(
  consultationId: string,
  _prev: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const patientId = formData.get('patient_id') as string

  const { error } = await supabase.from('consultations').update({
    fecha:                formData.get('fecha') as string,
    hora:                 formData.get('hora') as string || null,
    consultorio:          formData.get('consultorio') as string || null,
    motivo:               formData.get('motivo') as string || null,
    padecimiento:         formData.get('padecimiento') as string || null,
    exploracion:          formData.get('exploracion') as string || null,
    analisis:             formData.get('analisis') as string || null,
    dx:                   JSON.parse((formData.get('dx') as string) || '[]'),
    dx_texto:             formData.get('dx_texto') as string || null,
    tx:                   JSON.parse((formData.get('tx') as string) || '[]'),
    tx_texto:             formData.get('tx_texto') as string || null,
    estudios_solicitados: JSON.parse((formData.get('estudios_solicitados') as string) || '[]'),
    pronostico:           formData.get('pronostico') as string || null,
    signos_vitales: {
      ta:   (formData.get('sv_ta')   as string) || '120/80',
      fc:   (formData.get('sv_fc')   as string) || '72',
      fr:   (formData.get('sv_fr')   as string) || '16',
      temp: (formData.get('sv_temp') as string) || '36.5',
      spo2: (formData.get('sv_spo2') as string) || '98',
    },
  }).eq('id', consultationId).eq('user_id', user.id)

  if (error) return { error: error.message }
  redirect(`/pacientes/${patientId}/consulta/${consultationId}/imprimir`)
}
