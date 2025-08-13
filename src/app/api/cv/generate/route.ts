import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { CVGenerator, CVData } from '@/lib/cv/cv-generator';
import { SubscriptionService } from '@/lib/subscription/plans';

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

    // Vérifier l'abonnement utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        portfolios: {
          include: {
            projects: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a accès à la génération de CV
    const hasAccess = SubscriptionService.hasFeatureAccess(
      user.subscription?.planId || 'free',
      'cv_generation'
    );

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Fonctionnalité premium requise',
          feature: 'Génération de CV AI',
          currentPlan: user.subscription?.planId || 'free',
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    const { portfolioId } = await request.json();

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'ID du portfolio requis' },
        { status: 400 }
      );
    }

    // Récupérer le portfolio avec tous les projets
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: user.id
      },
      include: {
        projects: {
          orderBy: { featured: 'desc' }
        },
        user: true
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio non trouvé' },
        { status: 404 }
      );
    }

    // Convertir le portfolio en données CV
    const cvData: CVData = CVGenerator.portfolioToCV(portfolio);

    // Générer le PDF
    const generator = new CVGenerator();
    const pdf = generator.generateCV(cvData);

    // Convertir en buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Enregistrer la génération pour les stats
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        lastCvGeneration: new Date()
      }
    });

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${portfolio.user.name?.replace(/\s+/g, '-') || 'Portfolio'}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('CV generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du CV',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Endpoint pour récupérer les informations sur la fonctionnalité CV
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentification requise' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: true,
      portfolios: {
        select: {
          id: true,
          title: true,
          lastCvGeneration: true
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé' },
      { status: 404 }
    );
  }

  const hasAccess = SubscriptionService.hasFeatureAccess(
    user.subscription?.planId || 'free',
    'cv_generation'
  );

  return NextResponse.json({
    hasAccess,
    currentPlan: user.subscription?.planId || 'free',
    portfolios: user.portfolios.map(p => ({
      id: p.id,
      title: p.title,
      lastGeneration: p.lastCvGeneration
    }))
  });
}