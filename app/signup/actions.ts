'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureDoctorProfile } from '@/lib/doctor-profile'
import { redirect } from 'next/navigation'

export async function signupAction(
  _prevState: { error?: string; needsConfirmation?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Ingresa correo y contraseña.' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message.includes('already registered')
      ? 'Ya existe una cuenta con ese correo.'
      : 'No se pudo crear la cuenta. Intenta de nuevo.' }
  }

  if (!data.user) {
    return { error: 'No se pudo crear la cuenta. Intenta de nuevo.' }
  }

  if (!data.session) {
    // Confirmación de email activada en este proyecto de Supabase —
    // el perfil se crea solo hasta que confirme e inicie sesión por primera vez
    // (ver ensureDoctorProfile en app/(app)/layout.tsx).
    return { needsConfirmation: true }
  }

  await ensureDoctorProfile(data.user.id)
  redirect('/onboarding')
}
