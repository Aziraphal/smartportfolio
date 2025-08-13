import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe, PLAN_TO_PRICE_ID, StripePlan } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  planId: z.enum(['pro-monthly', 'pro-yearly', 'team-monthly', 'team-yearly']),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer cette action' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { planId, successUrl, cancelUrl } = checkoutSchema.parse(body)

    // Récupérer l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      
      customerId = customer.id
      
      // Sauvegarder le customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Obtenir l'URL de base
    const origin = req.headers.get('origin') || 'http://localhost:3001'
    
    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PLAN_TO_PRICE_ID[planId as StripePlan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${origin}/dashboard?success=true`,
      cancel_url: cancelUrl || `${origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}