export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limitations: Record<string, number>;
  popular?: boolean;
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    description: 'Parfait pour découvrir SmartPortfolio',
    features: [
      'Portfolio de base',
      '5 projets maximum',
      '2 intégrations (GitHub, Behance ou Dribbble)',
      'Thèmes de base',
      'Sous-domaine smartportfolio.com',
      'Support communautaire'
    ],
    limitations: {
      maxProjects: 5,
      maxIntegrations: 2,
      customDomain: 0,
      aiOptimizations: 0,
      themes: 3,
      storage: 100, // MB
      bandwidth: 1000 // MB/mois
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    currency: 'EUR',
    interval: 'month',
    description: 'Idéal pour les freelances et créatifs',
    popular: true,
    features: [
      'Projets illimités',
      'Toutes les intégrations disponibles',
      'IA SEO pour optimiser les descriptions',
      'Génération CV AI en PDF',
      'Thèmes premium',
      'Domaine personnalisé',
      'Analytics avancées',
      'Support prioritaire',
      'Sauvegarde automatique'
    ],
    limitations: {
      maxProjects: -1, // illimité
      maxIntegrations: -1,
      customDomain: 1,
      aiOptimizations: 100,
      themes: -1,
      storage: 1000, // 1GB
      bandwidth: 10000 // 10GB/mois
    }
  },
  {
    id: 'team',
    name: 'Équipe',
    price: 25,
    currency: 'EUR',
    interval: 'month',
    description: 'Pour les agences et équipes créatives',
    features: [
      'Tous les avantages Pro',
      'Génération CV AI en PDF',
      '5 portfolios par équipe',
      'Gestion multi-utilisateurs',
      'Marque blanche',
      'API complète',
      'Intégrations personnalisées',
      'Support dédié',
      'Formation incluse'
    ],
    limitations: {
      maxProjects: -1,
      maxIntegrations: -1,
      customDomain: 5,
      aiOptimizations: 500,
      themes: -1,
      storage: 5000, // 5GB
      bandwidth: 50000, // 50GB/mois
      teamMembers: 5,
      portfoliosPerTeam: 5
    }
  }
];

export class SubscriptionService {
  static getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  static getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  static getPublicPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  static canAccess(
    userSubscription: UserSubscription | null,
    feature: string,
    value?: number
  ): boolean {
    if (!userSubscription || userSubscription.status !== 'active') {
      return this.checkFreePlanAccess(feature, value);
    }

    const plan = this.getPlan(userSubscription.planId);
    if (!plan) return false;

    return this.checkPlanAccess(plan, feature, value);
  }

  private static checkFreePlanAccess(feature: string, value?: number): boolean {
    const freePlan = this.getPlan('free')!;
    return this.checkPlanAccess(freePlan, feature, value);
  }

  private static checkPlanAccess(
    plan: SubscriptionPlan,
    feature: string,
    value?: number
  ): boolean {
    const limitation = plan.limitations[feature];
    
    if (limitation === undefined) return true;
    if (limitation === -1) return true; // illimité
    if (limitation === 0) return false;
    if (value === undefined) return true;
    
    return value <= limitation;
  }

  static getUsageLimits(userSubscription: UserSubscription | null) {
    const planId = userSubscription?.status === 'active' 
      ? userSubscription.planId 
      : 'free';
    
    const plan = this.getPlan(planId);
    return plan?.limitations || SUBSCRIPTION_PLANS[0].limitations;
  }

  static calculatePrice(planId: string, interval: 'month' | 'year'): number {
    const plan = this.getPlan(planId);
    if (!plan) return 0;

    let price = plan.price;
    
    // Réduction annuelle de 20%
    if (interval === 'year') {
      price = price * 12 * 0.8;
    }
    
    return price;
  }

  static getRecommendation(usage: {
    projects: number;
    integrations: number;
    needsCustomDomain: boolean;
    needsAI: boolean;
    isTeam: boolean;
  }): string {
    if (usage.isTeam) {
      return 'team';
    }

    if (
      usage.projects > 5 || 
      usage.integrations > 2 || 
      usage.needsCustomDomain || 
      usage.needsAI
    ) {
      return 'pro';
    }

    return 'free';
  }

  static getUpgradeReasons(currentPlan: string, targetPlan: string): string[] {
    const current = this.getPlan(currentPlan);
    const target = this.getPlan(targetPlan);
    
    if (!current || !target) return [];

    const reasons: string[] = [];

    if (current.limitations.maxProjects !== -1 && target.limitations.maxProjects === -1) {
      reasons.push('Projets illimités');
    }

    if (current.limitations.customDomain === 0 && target.limitations.customDomain > 0) {
      reasons.push('Domaine personnalisé');
    }

    if (current.limitations.aiOptimizations === 0 && target.limitations.aiOptimizations > 0) {
      reasons.push('Optimisation IA SEO');
    }

    if (currentPlan === 'free' && targetPlan !== 'free') {
      reasons.push('Support prioritaire', 'Thèmes premium', 'Analytics avancées');
    }

    if (targetPlan === 'team') {
      reasons.push('Gestion d\'équipe', 'Marque blanche', 'API complète');
    }

    return reasons;
  }

  static isTrialEligible(userId: string): boolean {
    // Vérifier si l'utilisateur peut bénéficier d'un essai gratuit
    // Implémentation dépendante de la base de données
    return true; // Placeholder
  }

  static getTrialPeriod(): number {
    return 14; // 14 jours d'essai
  }

  // Utilitaires pour l'affichage des prix
  static formatPrice(price: number, currency: string = 'EUR', interval: 'month' | 'year' = 'month'): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    });

    const formattedPrice = formatter.format(price);
    const periodText = interval === 'month' ? '/mois' : '/an';
    
    return `${formattedPrice}${periodText}`;
  }

  static getAnnualSavings(planId: string): number {
    const plan = this.getPlan(planId);
    if (!plan || plan.price === 0) return 0;

    const monthlyTotal = plan.price * 12;
    const annualPrice = this.calculatePrice(planId, 'year');
    
    return monthlyTotal - annualPrice;
  }

  // Gestion des fonctionnalités
  static getFeatureAvailability() {
    return {
      projects: {
        free: 5,
        pro: -1,
        team: -1
      },
      integrations: {
        free: 2,
        pro: -1,
        team: -1
      },
      customDomain: {
        free: false,
        pro: true,
        team: true
      },
      aiSeo: {
        free: false,
        pro: true,
        team: true
      },
      analytics: {
        free: false,
        pro: true,
        team: true
      },
      teamManagement: {
        free: false,
        pro: false,
        team: true
      },
      whiteLabel: {
        free: false,
        pro: false,
        team: true
      },
      cv_generation: {
        free: false,
        pro: true,
        team: true
      }
    };
  }

  static hasFeatureAccess(planId: string, feature: string): boolean {
    const features = this.getFeatureAvailability();
    const featureConfig = features[feature as keyof typeof features];
    
    if (!featureConfig) return false;
    
    return featureConfig[planId as keyof typeof featureConfig] === true || 
           featureConfig[planId as keyof typeof featureConfig] === -1;
  }
}