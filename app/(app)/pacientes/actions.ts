'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type ActionState = { error: string } | undefined

function buildPatientData(formData: FormData) {
  const sexo = (formData.get('sexo') as string) || null
  return {
    nombre: (formData.get('nombre') as string).trim(),
    fecha_nacimiento: (formData.get('fecha_nacimiento') as string) || null,
    sexo,
    lugar_nacimiento: (formData.get('lugar_nacimiento') as string) || null,
    ciudad: (formData.get('ciudad') as string) || null,
    escolaridad: (formData.get('escolaridad') as string) || null,
    ocupacion: (formData.get('ocupacion') as string) || null,
    estado_civil: (formData.get('estado_civil') as string) || null,
    religion: (formData.get('religion') as string) || null,
    hemotipo: (formData.get('hemotipo') as string) || null,
    telefono: (formData.get('telefono') as string) || null,
    fecha_consulta: (formData.get('fecha_consulta') as string) || null,
    consultorio: (formData.get('consultorio') as string) || null,
    fuente: (formData.get('fuente') as string) || null,
    refiere: (formData.get('refiere') as string) || null,
    ahf_abuelo_materno: (formData.get('ahf_abuelo_materno') as string) || null,
    ahf_abuela_materna: (formData.get('ahf_abuela_materna') as string) || null,
    ahf_abuelo_paterno: (formData.get('ahf_abuelo_paterno') as string) || null,
    ahf_abuela_paterna: (formData.get('ahf_abuela_paterna') as string) || null,
    ahf_padre: (formData.get('ahf_padre') as string) || null,
    ahf_madre: (formData.get('ahf_madre') as string) || null,
    ahf_hermanos: (formData.get('ahf_hermanos') as string) || null,
    ahf_hijos: (formData.get('ahf_hijos') as string) || null,
    ahf_otros: (formData.get('ahf_otros') as string) || null,
    otros_np: (formData.get('otros_np') as string) || null,
    cronicos: (formData.get('cronicos') as string) || null,
    quirurgicos: (formData.get('quirurgicos') as string) || null,
    alergicos: (formData.get('alergicos') as string) || null,
    medicamentos: (formData.get('medicamentos') as string) || null,
    transfusiones: (formData.get('transfusiones') as string) || null,
    tabaquismo: (formData.get('tabaquismo') as string) || null,
    alcohol: (formData.get('alcohol') as string) || null,
    drogas: (formData.get('drogas') as string) || null,
    gesta: sexo === 'F' ? ((formData.get('gesta') as string) || null) : null,
    menarca: sexo === 'F' ? ((formData.get('menarca') as string) || null) : null,
    ritmo: sexo === 'F' ? ((formData.get('ritmo') as string) || null) : null,
    fur: sexo === 'F' ? ((formData.get('fur') as string) || null) : null,
    anticonceptivos: sexo === 'F' ? ((formData.get('anticonceptivos') as string) || null) : null,
    padecimiento: (formData.get('padecimiento') as string) || null,
    exploracion: (formData.get('exploracion') as string) || null,
    dx: JSON.parse((formData.get('dx') as string) || '[]') as string[],
    dx_texto: (formData.get('dx_texto') as string) || null,
    tx: JSON.parse((formData.get('tx') as string) || '[]') as string[],
    tx_texto: (formData.get('tx_texto') as string) || null,
    estudios_solicitados: JSON.parse((formData.get('estudios_solicitados') as string) || '[]') as string[],
    signos_vitales: {
      ta:   (formData.get('sv_ta')   as string) || null,
      fc:   (formData.get('sv_fc')   as string) || null,
      fr:   (formData.get('sv_fr')   as string) || null,
      temp: (formData.get('sv_temp') as string) || null,
      spo2: (formData.get('sv_spo2') as string) || null,
    },
    pronostico: (formData.get('pronostico') as string) || null,
  }
}

export async function createPatient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre del paciente es obligatorio.' }

  const { data, error } = await supabase
    .from('patients')
    .insert({ ...buildPatientData(formData), user_id: user.id })
    .select('id')
    .single()

  if (error || !data) return { error: 'Error al guardar el expediente. Intenta de nuevo.' }
  redirect(`/pacientes/${data.id}`)
}

export async function updatePatient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre del paciente es obligatorio.' }

  const { error } = await supabase
    .from('patients')
    .update(buildPatientData(formData))
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al actualizar el expediente. Intenta de nuevo.' }
  redirect(`/pacientes/${id}`)
}

export async function addEvolutionNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const patient_id = formData.get('patient_id') as string
  const nota = (formData.get('nota') as string)?.trim()
  const fecha = (formData.get('fecha') as string) || new Date().toISOString().slice(0, 10)

  if (!nota) return { error: 'La nota no puede estar vacía.' }

  const { error } = await supabase
    .from('evolution_notes')
    .insert({ patient_id, user_id: user.id, nota, fecha })

  if (error) return { error: 'Error al guardar la nota.' }
  redirect(`/pacientes/${patient_id}`)
}
