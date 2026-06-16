import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente con permisos de servicio (bypassa RLS) — usar SOLO en el webhook
// de Stripe, que no tiene sesión de usuario. Nunca exponer al cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
