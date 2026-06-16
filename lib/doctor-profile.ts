import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { DoctorProfile } from '@/lib/types'

const TRIAL_DAYS = 14

export async function ensureDoctorProfile(userId: string) {
  const supabase = await createClient()
  await supabase
    .from('doctor_profiles')
    .upsert(
      {
        user_id: userId,
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
}

export const getDoctorProfile = cache(async (): Promise<DoctorProfile | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (data as DoctorProfile | null) ?? null
})
