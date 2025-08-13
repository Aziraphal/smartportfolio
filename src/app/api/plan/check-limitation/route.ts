import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createPlanLimiterForUser, ActionType } from '@/lib/limitations/plan-limiter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { action, quantity = 1 } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer le limiter et vérifier
    const limiter = await createPlanLimiterForUser(user.id);
    const result = await limiter.canPerformAction(action as ActionType, quantity);

    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason,
      upgradeRequired: !result.allowed,
      currentPlan: user.subscription?.planId || 'free',
      usage: {
        current: result.currentUsage,
        limit: result.limit
      }
    });

  } catch (error) {
    console.error('Erreur vérification limitation:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification des limitations',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer le limiter et récupérer le statut complet
    const limiter = await createPlanLimiterForUser(user.id);
    const status = await limiter.getLimitationStatus();

    return NextResponse.json({
      currentPlan: user.subscription?.planId || 'free',
      status
    });

  } catch (error) {
    console.error('Erreur récupération statut limitations:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}