import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    // Vérifier si l'événement a déjà été traité
    const existingEvent = await prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id }
    })

    if (existingEvent?.processed) {
      return NextResponse.json({ received: true })
    }

    // Enregistrer l'événement
    await prisma.stripeEvent.upsert({
      where: { stripeEventId: event.id },
      update: { processed: false },
      create: {
        stripeEventId: event.id,
        type: event.type,
        processed: false,
      }
    })

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Marquer l'événement comme traité
    await prisma.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true }
    })

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    await prisma.userSubscription.create({
      data: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCustomerId: subscription.customer as string,
        planId: planId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }
    })

    // Mettre à jour le plan de l'utilisateur
    const newPlan = planId.startsWith('pro') ? 'pro' : 'team'
    await prisma.user.update({
      where: { id: userId },
      data: { 
        plan: newPlan,
        stripeCustomerId: subscription.customer as string
      }
    })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId

  if (!userId) return

  await prisma.userSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    create: {
      userId: userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCustomerId: subscription.customer as string,
      planId: planId || 'pro',
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.userSubscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  })

  // Mettre à jour le plan utilisateur si nécessaire
  const userSub = await prisma.userSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    include: { user: true }
  })

  if (userSub && subscription.status === 'active') {
    const newPlan = userSub.planId.startsWith('pro') ? 'pro' : 'team'
    if (userSub.user.plan !== newPlan) {
      await prisma.user.update({
        where: { id: userSub.userId },
        data: { plan: newPlan }
      })
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.userSubscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' }
  })

  // Remettre l'utilisateur en plan gratuit
  const userSub = await prisma.userSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  })

  if (userSub) {
    await prisma.user.update({
      where: { id: userSub.userId },
      data: { plan: 'free' }
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Logique pour gérer les paiements réussis
  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Logique pour gérer les paiements échoués
  console.log(`Payment failed for invoice: ${invoice.id}`)
  
  if (invoice.subscription) {
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'incomplete' }
    })
  }
}