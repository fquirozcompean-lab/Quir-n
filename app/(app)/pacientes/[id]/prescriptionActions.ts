'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createPrescriptionAction(patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: patient }, { data: latestConsult }] = await Promise.all([
    supabase
      .from('patients')
      .select('nombre, consultorio, dx, dx_texto, tx, tx_texto, estudios_solicitados, fecha_consulta')
      .eq('id', patientId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('consultations')
      .select('fecha, consultorio, dx, dx_texto, tx, tx_texto, estudios_solicitados')
      .eq('patient_id', patientId)
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!patient) return { error: 'Paciente no encontrado.' }

  // Use latest follow-up consultation if available, otherwise fall back to base record
  const src = latestConsult ?? patient

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id:      patientId,
      user_id:         user.id,
      fecha:           (latestConsult?.fecha ?? patient.fecha_consulta) ?? new Date().toISOString().slice(0, 10),
      paciente_nombre: patient.nombre,
      consultorio:     src.consultorio ?? patient.consultorio,
      dx:              src.dx  ?? [],
      dx_texto:        src.dx_texto,
      tx:              src.tx  ?? [],
      tx_texto:        src.tx_texto,
      estudios:        src.estudios_solicitados ?? [],
    })
    .select('token')
    .single()

  if (error || !data) return { error: 'Error al generar la receta. Verifica que la tabla prescriptions existe en Supabase.' }
  return { token: data.token as string }
}

/**
 * Genera una receta/solicitud independiente, sin depender de una consulta
 * registrada — para compartir indicaciones o estudios solicitados a un
 * paciente al que no se le dio consulta formal.
 */
export async function createQuickPrescriptionAction(
  patientId: string,
  estudios: string[],
  texto: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!texto.trim() && estudios.length === 0) {
    return { error: 'Agrega al menos un estudio o un texto de indicaciones.' }
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('nombre, consultorio')
    .eq('id', patientId)
    .eq('user_id', user.id)
    .single()

  if (!patient) return { error: 'Paciente no encontrado.' }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id:      patientId,
      user_id:         user.id,
      fecha:           new Date().toISOString().slice(0, 10),
      paciente_nombre: patient.nombre,
      consultorio:     patient.consultorio,
      dx:              [],
      dx_texto:        null,
      tx:              [],
      tx_texto:        texto.trim() || null,
      estudios,
    })
    .select('token')
    .single()

  if (error || !data) return { error: 'Error al generar la receta.' }
  return { token: data.token as string }
}
