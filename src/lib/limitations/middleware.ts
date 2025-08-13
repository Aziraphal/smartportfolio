import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createPlanLimiterForUser, ActionType, PlanLimitationError } from './plan-limiter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LimitationConfig {
  action: ActionType;
  quantity?: number;
  onError?: 'block' | 'warn';
}

/**
 * Middleware pour vérifier les limitations de plan
 */
export async function withPlanLimitation(
  request: NextRequest,
  config: LimitationConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Vérifier l'authentification
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

    // Créer le limiter
    const limiter = await createPlanLimiterForUser(user.id);

    // Vérifier les limitations
    const result = await limiter.canPerformAction(
      config.action,
      config.quantity || 1
    );

    if (!result.allowed) {
      if (config.onError === 'warn') {
        // Mode warning : continuer mais ajouter un header d'avertissement
        const response = await handler(request);
        response.headers.set('X-Plan-Warning', result.reason || 'Limitation approchée');
        response.headers.set('X-Plan-Usage', JSON.stringify({
          current: result.currentUsage,
          limit: result.limit
        }));
        return response;
      } else {
        // Mode block (par défaut) : bloquer la requête
        return NextResponse.json(
          {
            error: result.reason || 'Limitation de plan atteinte',
            upgradeRequired: true,
            currentPlan: user.subscription?.planId || 'free',
            usage: {
              current: result.currentUsage,
              limit: result.limit
            }
          },
          { status: 403 }
        );
      }
    }

    // Ajouter les informations de limitation à la requête
    const enhancedRequest = request.clone();
    enhancedRequest.headers.set('X-User-Id', user.id);
    enhancedRequest.headers.set('X-User-Plan', user.subscription?.planId || 'free');
    enhancedRequest.headers.set('X-Limitation-Check', 'passed');

    return await handler(enhancedRequest);

  } catch (error) {
    console.error('Erreur dans withPlanLimitation:', error);
    
    if (error instanceof PlanLimitationError) {
      return NextResponse.json(
        {
          error: error.message,
          action: error.action,
          planId: error.planId,
          upgradeRequired: true,
          usage: {
            current: error.currentUsage,
            limit: error.limit
          }
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * Décorateur pour appliquer facilement les limitations
 */
export function requirePlanFeature(action: ActionType, quantity?: number) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (request: NextRequest) {
      return withPlanLimitation(
        request,
        { action, quantity },
        method.bind(this)
      );
    };
  };
}

/**
 * Hook pour vérifier les limitations côté client
 */
export async function checkPlanLimitation(
  action: ActionType,
  quantity?: number
): Promise<{
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentPlan?: string;
}> {
  try {
    const response = await fetch('/api/plan/check-limitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, quantity })
    });

    return await response.json();
  } catch (error) {
    console.error('Erreur vérification limitation:', error);
    return {
      allowed: false,
      reason: 'Erreur lors de la vérification des limitations'
    };
  }
}

/**
 * Composant React pour afficher les limitations
 */
export interface PlanLimitationMessageProps {
  action: ActionType;
  currentPlan: string;
  usage?: {
    current: number;
    limit: number;
  };
  onUpgrade?: () => void;
}

export function getPlanLimitationMessage(
  action: ActionType,
  currentPlan: string
): string {
  const messages = {
    create_project: `Le plan ${currentPlan} limite le nombre de projets. Passez à un plan supérieur pour plus de projets.`,
    add_integration: `Le plan ${currentPlan} limite le nombre d'intégrations. Passez au plan Pro pour des intégrations illimitées.`,
    create_portfolio: `Le plan ${currentPlan} limite le nombre de portfolios. Passez au plan Pro pour plus de portfolios.`,
    use_custom_domain: 'Les domaines personnalisés sont disponibles uniquement sur les plans Pro et Équipe.',
    generate_cv: 'La génération de CV est disponible uniquement sur les plans Pro et Équipe.',
    use_ai_optimization: 'Les optimisations IA sont limitées sur votre plan actuel.',
    access_analytics: 'Les analytics avancées sont disponibles uniquement sur les plans Pro et Équipe.'
  };

  return messages[action] || 'Cette fonctionnalité nécessite un plan supérieur.';
}

/**
 * Utilitaires pour les composants React
 */
export function formatLimitationStatus(
  used: number,
  limit: number,
  isUnlimited: boolean = false
): string {
  if (isUnlimited || limit === -1) {
    return `${used} (illimité)`;
  }
  return `${used}/${limit}`;
}

export function getLimitationColor(percentage: number): string {
  if (percentage >= 100) return 'text-red-600';
  if (percentage >= 80) return 'text-yellow-600';
  return 'text-green-600';
}

export function getLimitationBgColor(percentage: number): string {
  if (percentage >= 100) return 'bg-red-50 border-red-200';
  if (percentage >= 80) return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
}