import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

function statusFromStripe(status: Stripe.Subscription.Status): string {
  if (status === 'trialing' || status === 'active') return status
  if (status === 'past_due' || status === 'unpaid') return 'past_due'
  if (status === 'canceled' || status === 'incomplete_expired') return 'canceled'
  return 'incomplete'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) return new NextResponse('Missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const supabase = createAdminClient()

  async function syncSubscription(subscriptionId: string, customerId: string) {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId)
    await supabase
      .from('doctor_profiles')
      .update({
        stripe_subscription_id: sub.id,
        subscription_status: statusFromStripe(sub.status),
        current_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.customer && session.subscription) {
        await syncSubscription(session.subscription as string, session.customer as string)
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      await syncSubscription(sub.id, sub.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('doctor_profiles')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.customer) {
        await supabase
          .from('doctor_profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
