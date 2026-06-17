'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PatientDraft {
  nombre: string
  fecha_nacimiento?: string | null
  sexo?: string | null
  telefono?: string | null
  ciudad?: string | null
  lugar_nacimiento?: string | null
  ocupacion?: string | null
  estado_civil?: string | null
  religion?: string | null
  hemotipo?: string | null
  cronicos?: string | null
  quirurgicos?: string | null
  alergicos?: string | null
  medicamentos?: string | null
  tabaquismo?: string | null
  alcohol?: string | null
  drogas?: string | null
  padecimiento?: string | null
  exploracion?: string | null
  dx_texto?: string | null
  tx_texto?: string | null
}

export async function importPatients(patients: PatientDraft[]): Promise<{ saved?: number; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const today = new Date().toISOString().slice(0, 10)

  const rows = patients
    .filter(p => p.nombre?.trim())
    .map(p => ({
      user_id: user.id,
      nombre: p.nombre.trim(),
      fecha_nacimiento: p.fecha_nacimiento || null,
      sexo: p.sexo || null,
      telefono: p.telefono || null,
      ciudad: p.ciudad || null,
      lugar_nacimiento: p.lugar_nacimiento || null,
      ocupacion: p.ocupacion || null,
      estado_civil: p.estado_civil || null,
      religion: p.religion || null,
      hemotipo: p.hemotipo || null,
      cronicos: p.cronicos || null,
      quirurgicos: p.quirurgicos || null,
      alergicos: p.alergicos || null,
      medicamentos: p.medicamentos || null,
      tabaquismo: p.tabaquismo || null,
      alcohol: p.alcohol || null,
      drogas: p.drogas || null,
      padecimiento: p.padecimiento || null,
      exploracion: p.exploracion || null,
      dx: [] as string[],
      dx_texto: p.dx_texto || null,
      tx: [] as string[],
      tx_texto: p.tx_texto || null,
      fecha_consulta: today,
    }))

  if (rows.length === 0) return { error: 'No hay pacientes para guardar' }

  const { error } = await supabase.from('patients').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/pacientes')
  return { saved: rows.length }
}
