'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type ActionState = { error?: string; success?: boolean } | undefined

async function uploadBrandingAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  kind: 'logo' | 'firma'
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${userId}/${kind}.${ext}`
  const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true })
  if (error) return null
  const { data } = supabase.storage.from('branding').getPublicUrl(path)
  return data.publicUrl
}

export async function updateDoctorProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const update: Record<string, unknown> = {
    nombre,
    nombre_corto: (formData.get('nombre_corto') as string)?.trim() || nombre,
    apellido1: (formData.get('apellido1') as string)?.trim() || '',
    apellido2: (formData.get('apellido2') as string)?.trim() || '',
    nombres: (formData.get('nombres') as string)?.trim() || '',
    especialidades: (formData.get('especialidades') as string)?.trim() || '',
    especialidad: (formData.get('especialidad') as string)?.trim() || '',
    cedula_prof: (formData.get('cedula_prof') as string)?.trim() || '',
    cedula_esp: (formData.get('cedula_esp') as string)?.trim() || null,
    cedula_esp2: (formData.get('cedula_esp2') as string)?.trim() || null,
    email: (formData.get('email') as string)?.trim() || null,
    email_seguros: (formData.get('email_seguros') as string)?.trim() || null,
    celular: (formData.get('celular') as string)?.trim() || null,
    rfc: (formData.get('rfc') as string)?.trim() || null,
    emergencias: (formData.get('emergencias') as string)?.trim() || null,
    ciudad: (formData.get('ciudad') as string)?.trim() || null,
    review_url: (formData.get('review_url') as string)?.trim() || null,
    procedimiento: {
      label: (formData.get('procedimiento_label') as string)?.trim() || 'Colonoscopía',
      href: (formData.get('procedimiento_href') as string)?.trim() || '/colonoscopia',
      mostrar: formData.get('procedimiento_mostrar') === 'on',
    },
    consultorios: JSON.parse((formData.get('consultorios') as string) || '{}'),
    cat_dx: JSON.parse((formData.get('cat_dx') as string) || '[]'),
    cat_tx: JSON.parse((formData.get('cat_tx') as string) || '[]'),
    cat_est: JSON.parse((formData.get('cat_est') as string) || '[]'),
    cat_posologia: JSON.parse((formData.get('cat_posologia') as string) || '{}'),
    onboarding_done: true,
  }

  const logoFile = formData.get('logo') as File | null
  if (logoFile && logoFile.size > 0) {
    const url = await uploadBrandingAsset(supabase, user.id, logoFile, 'logo')
    if (url) update.logo_url = url
  }
  const firmaFile = formData.get('firma') as File | null
  if (firmaFile && firmaFile.size > 0) {
    const url = await uploadBrandingAsset(supabase, user.id, firmaFile, 'firma')
    if (url) update.firma_url = url
  }

  const { error } = await supabase.from('doctor_profiles').update(update).eq('user_id', user.id)
  if (error) return { error: 'No se pudo guardar la configuración. Intenta de nuevo.' }

  revalidatePath('/', 'layout')
  return { success: true }
}
