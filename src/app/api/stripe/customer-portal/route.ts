import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder au portail client' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé pour cet utilisateur' },
        { status: 404 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3001'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    })

    return NextResponse.json({
      url: portalSession.url,
    })

  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du portail client' },
      { status: 500 }
    )
  }
}