'use server'

import { createClient } from '@/lib/supabase/server'

export async function forgotPasswordAction(
  _prevState: { error?: string; sent?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Ingresa tu correo.' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quironmd.com'
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  return { sent: true }
}
