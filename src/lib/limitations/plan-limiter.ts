import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '@/lib/subscription/plans';

const prisma = new PrismaClient();

export interface PlanLimitations {
  maxProjects: number;
  maxIntegrations: number;
  customDomain: boolean;
  aiOptimizations: number;
  maxPortfolios: number;
  storage: number; // MB
  bandwidth: number; // MB/mois
  cvGeneration: boolean;
  analytics: boolean;
  prioritySupport: boolean;
}

export interface UsageData {
  projects: number;
  integrations: number;
  portfolios: number;
  aiOptimizationsUsed: number;
  storageUsed: number;
  bandwidthUsed: number;
  cvGenerationsThisMonth: number;
}

export class PlanLimiter {
  private userId: string;
  private planId: string;

  constructor(userId: string, planId: string = 'free') {
    this.userId = userId;
    this.planId = planId;
  }

  /**
   * Récupère les limitations du plan actuel
   */
  getLimitations(): PlanLimitations {
    const plan = SubscriptionService.getPlan(this.planId);
    if (!plan) {
      return this.getFreePlanLimitations();
    }

    return {
      maxProjects: plan.limitations.maxProjects === -1 ? Infinity : plan.limitations.maxProjects,
      maxIntegrations: plan.limitations.maxIntegrations === -1 ? Infinity : plan.limitations.maxIntegrations,
      customDomain: plan.limitations.customDomain > 0,
      aiOptimizations: plan.limitations.aiOptimizations === -1 ? Infinity : plan.limitations.aiOptimizations,
      maxPortfolios: plan.limitations.portfoliosPerTeam || (this.planId === 'free' ? 1 : Infinity),
      storage: plan.limitations.storage,
      bandwidth: plan.limitations.bandwidth,
      cvGeneration: SubscriptionService.hasFeatureAccess(this.planId, 'cv_generation'),
      analytics: SubscriptionService.hasFeatureAccess(this.planId, 'analytics'),
      prioritySupport: this.planId !== 'free'
    };
  }

  private getFreePlanLimitations(): PlanLimitations {
    return {
      maxProjects: 5,
      maxIntegrations: 2,
      customDomain: false,
      aiOptimizations: 0,
      maxPortfolios: 1,
      storage: 100,
      bandwidth: 1000,
      cvGeneration: false,
      analytics: false,
      prioritySupport: false
    };
  }

  /**
   * Récupère l'usage actuel de l'utilisateur
   */
  async getCurrentUsage(): Promise<UsageData> {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      include: {
        portfolios: {
          include: {
            projects: true,
            integrations: true,
            _count: {
              select: {
                projects: true
              }
            }
          }
        },
        _count: {
          select: {
            portfolios: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const totalProjects = user.portfolios.reduce((sum, p) => sum + p._count.projects, 0);
    const totalIntegrations = user.portfolios.reduce((sum, p) => sum + p.integrations.length, 0);

    // TODO: Implémenter le tracking des AI optimizations, storage, bandwidth et CV generations
    return {
      projects: totalProjects,
      integrations: totalIntegrations,
      portfolios: user._count.portfolios,
      aiOptimizationsUsed: 0, // À implémenter
      storageUsed: 0, // À implémenter
      bandwidthUsed: 0, // À implémenter
      cvGenerationsThisMonth: 0 // À implémenter
    };
  }

  /**
   * Vérifie si une action est autorisée
   */
  async canPerformAction(action: ActionType, quantity: number = 1): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage?: number;
    limit?: number;
  }> {
    const limitations = this.getLimitations();
    const usage = await this.getCurrentUsage();

    switch (action) {
      case 'create_project':
        const projectLimit = limitations.maxProjects;
        if (projectLimit === Infinity) return { allowed: true };
        
        return {
          allowed: usage.projects + quantity <= projectLimit,
          reason: `Limite de ${projectLimit} projets atteinte`,
          currentUsage: usage.projects,
          limit: projectLimit
        };

      case 'add_integration':
        const integrationLimit = limitations.maxIntegrations;
        if (integrationLimit === Infinity) return { allowed: true };
        
        return {
          allowed: usage.integrations + quantity <= integrationLimit,
          reason: `Limite de ${integrationLimit} intégrations atteinte`,
          currentUsage: usage.integrations,
          limit: integrationLimit
        };

      case 'create_portfolio':
        const portfolioLimit = limitations.maxPortfolios;
        if (portfolioLimit === Infinity) return { allowed: true };
        
        return {
          allowed: usage.portfolios + quantity <= portfolioLimit,
          reason: `Limite de ${portfolioLimit} portfolio(s) atteinte`,
          currentUsage: usage.portfolios,
          limit: portfolioLimit
        };

      case 'use_custom_domain':
        return {
          allowed: limitations.customDomain,
          reason: 'Domaine personnalisé non disponible sur votre plan',
        };

      case 'generate_cv':
        return {
          allowed: limitations.cvGeneration,
          reason: 'Génération CV non disponible sur votre plan',
        };

      case 'use_ai_optimization':
        const aiLimit = limitations.aiOptimizations;
        if (aiLimit === Infinity) return { allowed: true };
        
        return {
          allowed: usage.aiOptimizationsUsed + quantity <= aiLimit,
          reason: `Limite de ${aiLimit} optimisations IA atteinte ce mois`,
          currentUsage: usage.aiOptimizationsUsed,
          limit: aiLimit
        };

      case 'access_analytics':
        return {
          allowed: limitations.analytics,
          reason: 'Analytics avancées non disponibles sur votre plan',
        };

      default:
        return { allowed: false, reason: 'Action non reconnue' };
    }
  }

  /**
   * Vérifie et bloque si nécessaire
   */
  async checkAndEnforce(action: ActionType, quantity: number = 1): Promise<void> {
    const result = await this.canPerformAction(action, quantity);
    
    if (!result.allowed) {
      throw new PlanLimitationError(
        result.reason || 'Action non autorisée',
        action,
        this.planId,
        result.currentUsage,
        result.limit
      );
    }
  }

  /**
   * Récupère le statut des limitations avec pourcentages
   */
  async getLimitationStatus(): Promise<LimitationStatus> {
    const limitations = this.getLimitations();
    const usage = await this.getCurrentUsage();

    return {
      projects: {
        used: usage.projects,
        limit: limitations.maxProjects === Infinity ? -1 : limitations.maxProjects,
        percentage: limitations.maxProjects === Infinity ? 0 : (usage.projects / limitations.maxProjects) * 100
      },
      integrations: {
        used: usage.integrations,
        limit: limitations.maxIntegrations === Infinity ? -1 : limitations.maxIntegrations,
        percentage: limitations.maxIntegrations === Infinity ? 0 : (usage.integrations / limitations.maxIntegrations) * 100
      },
      portfolios: {
        used: usage.portfolios,
        limit: limitations.maxPortfolios === Infinity ? -1 : limitations.maxPortfolios,
        percentage: limitations.maxPortfolios === Infinity ? 0 : (usage.portfolios / limitations.maxPortfolios) * 100
      },
      aiOptimizations: {
        used: usage.aiOptimizationsUsed,
        limit: limitations.aiOptimizations === Infinity ? -1 : limitations.aiOptimizations,
        percentage: limitations.aiOptimizations === Infinity ? 0 : (usage.aiOptimizationsUsed / limitations.aiOptimizations) * 100
      },
      storage: {
        used: usage.storageUsed,
        limit: limitations.storage,
        percentage: (usage.storageUsed / limitations.storage) * 100
      },
      features: {
        customDomain: limitations.customDomain,
        cvGeneration: limitations.cvGeneration,
        analytics: limitations.analytics,
        prioritySupport: limitations.prioritySupport
      }
    };
  }
}

export type ActionType = 
  | 'create_project'
  | 'add_integration'
  | 'create_portfolio'
  | 'use_custom_domain'
  | 'generate_cv'
  | 'use_ai_optimization'
  | 'access_analytics';

export interface LimitationStatus {
  projects: {
    used: number;
    limit: number;
    percentage: number;
  };
  integrations: {
    used: number;
    limit: number;
    percentage: number;
  };
  portfolios: {
    used: number;
    limit: number;
    percentage: number;
  };
  aiOptimizations: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
  features: {
    customDomain: boolean;
    cvGeneration: boolean;
    analytics: boolean;
    prioritySupport: boolean;
  };
}

export class PlanLimitationError extends Error {
  public action: ActionType;
  public planId: string;
  public currentUsage?: number;
  public limit?: number;

  constructor(
    message: string,
    action: ActionType,
    planId: string,
    currentUsage?: number,
    limit?: number
  ) {
    super(message);
    this.name = 'PlanLimitationError';
    this.action = action;
    this.planId = planId;
    this.currentUsage = currentUsage;
    this.limit = limit;
  }
}

// Utilitaire pour créer un limiter pour un utilisateur
export async function createPlanLimiterForUser(userId: string): Promise<PlanLimiter> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true
    }
  });

  const planId = user?.subscription?.planId || 'free';
  return new PlanLimiter(userId, planId);
}