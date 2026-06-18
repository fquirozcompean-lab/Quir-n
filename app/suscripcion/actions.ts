'use server'

import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { redirect } from 'next/navigation'

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://quironmd.com'
}

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const priceId = (formData.get('priceId') as string) || process.env.STRIPE_PRICE_MONTHLY!

  const profile = await getDoctorProfile()
  let customerId = profile?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('doctor_profiles').update({ stripe_customer_id: customerId }).eq('user_id', user.id)
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
    success_url: `${baseUrl()}/suscripcion?success=1`,
    cancel_url: `${baseUrl()}/suscripcion`,
  })

  redirect(session.url!)
}

export async function createBillingPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getDoctorProfile()
  if (!profile?.stripe_customer_id) redirect('/suscripcion')

  const portal = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl()}/suscripcion`,
  })

  redirect(portal.url)
}
