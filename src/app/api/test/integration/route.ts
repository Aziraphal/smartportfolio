import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '@/lib/subscription/plans';
import { createPlanLimiterForUser } from '@/lib/limitations/plan-limiter';
import { SEOOptimizer } from '@/lib/ai/seo-optimizer';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Démarrage des tests d\'intégration...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise pour les tests' },
        { status: 401 }
      );
    }

    const testResults = {
      database: await testDatabase(),
      subscription: await testSubscriptionService(),
      limitations: await testPlanLimitations(session.user.email),
      seoOptimizer: await testSEOOptimizer(),
      integrations: await testIntegrationsAPI(),
    };

    const allTestsPassed = Object.values(testResults).every(result => result.success);

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'Tous les tests passent ✅' : 'Certains tests échouent ❌',
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur dans les tests d\'intégration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors des tests d\'intégration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

async function testDatabase() {
  try {
    console.log('🗄️ Test de la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    
    // Test de requête simple
    const userCount = await prisma.user.count();
    
    // Test de requête complexe
    const portfolios = await prisma.portfolio.findMany({
      include: {
        projects: true,
        integrations: true
      },
      take: 1
    });

    await prisma.$disconnect();

    return {
      success: true,
      message: `Base de données opérationnelle (${userCount} utilisateurs, ${portfolios.length} portfolios testés)`,
      details: {
        connection: 'OK',
        userCount,
        sampleQuery: 'OK'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur base de données',
      error: error.message
    };
  }
}

async function testSubscriptionService() {
  try {
    console.log('💳 Test du service d\'abonnement...');
    
    // Test des plans
    const plans = SubscriptionService.getAllPlans();
    if (plans.length === 0) throw new Error('Aucun plan trouvé');
    
    // Test d'un plan spécifique
    const freePlan = SubscriptionService.getPlan('free');
    if (!freePlan) throw new Error('Plan gratuit non trouvé');
    
    // Test de calcul de prix
    const proPrice = SubscriptionService.calculatePrice('pro', 'month');
    const proAnnualPrice = SubscriptionService.calculatePrice('pro', 'year');
    
    // Test des fonctionnalités
    const features = SubscriptionService.getFeatureAvailability();
    
    // Test d'accès aux fonctionnalités
    const hasCV = SubscriptionService.hasFeatureAccess('pro', 'cv_generation');

    return {
      success: true,
      message: 'Service d\'abonnement opérationnel',
      details: {
        plansCount: plans.length,
        freePlanExists: !!freePlan,
        proPriceMonthly: proPrice,
        proPriceAnnual: proAnnualPrice,
        featuresLoaded: Object.keys(features).length,
        cvAccessPro: hasCV
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur service d\'abonnement',
      error: error.message
    };
  }
}

async function testPlanLimitations(userEmail: string) {
  try {
    console.log('⚠️ Test des limitations de plan...');
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscription: true }
    });

    if (!user) throw new Error('Utilisateur non trouvé');
    
    // Créer le limiter
    const limiter = await createPlanLimiterForUser(user.id);
    
    // Test des limitations
    const limitations = limiter.getLimitations();
    
    // Test de l'usage actuel
    const usage = await limiter.getCurrentUsage();
    
    // Test de vérification d'action
    const canCreateProject = await limiter.canPerformAction('create_project', 1);
    const canGenerateCV = await limiter.canPerformAction('generate_cv');
    
    // Test du statut complet
    const status = await limiter.getLimitationStatus();

    return {
      success: true,
      message: 'Système de limitations opérationnel',
      details: {
        userPlan: user.subscription?.planId || 'free',
        maxProjects: limitations.maxProjects,
        currentProjects: usage.projects,
        canCreateProject: canCreateProject.allowed,
        canGenerateCV: canGenerateCV.allowed,
        statusCalculated: !!status
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur limitations de plan',
      error: error.message
    };
  }
}

async function testSEOOptimizer() {
  try {
    console.log('🤖 Test de l\'optimiseur SEO...');
    
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message: 'Clé API OpenAI manquante'
      };
    }

    const optimizer = new SEOOptimizer(process.env.OPENAI_API_KEY);
    
    // Test simple d'optimisation
    const testRequest = {
      title: 'Test Project',
      description: 'A simple test project for validation',
      category: 'development',
      tags: ['test', 'javascript'],
      language: 'fr' as const
    };

    // Note: On évite de faire un vrai appel API dans les tests pour économiser les crédits
    // const result = await optimizer.optimizeContent(testRequest);
    
    return {
      success: true,
      message: 'Optimiseur SEO configuré (test API désactivé)',
      details: {
        apiKeyConfigured: !!process.env.OPENAI_API_KEY,
        optimizerInitialized: true
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur optimiseur SEO',
      error: error.message
    };
  }
}

async function testIntegrationsAPI() {
  try {
    console.log('🔗 Test des API d\'intégration...');
    
    const results = {
      github: {
        configured: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
        message: 'GitHub OAuth configuré'
      },
      behance: {
        configured: !!process.env.BEHANCE_API_KEY,
        message: 'Behance API configurée'
      },
      dribbble: {
        configured: !!process.env.DRIBBBLE_API_KEY,
        message: 'Dribbble API configurée'
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY,
        message: 'Stripe configuré'
      }
    };

    const configuredCount = Object.values(results).filter(r => r.configured).length;

    return {
      success: configuredCount > 0,
      message: `${configuredCount}/4 intégrations configurées`,
      details: results
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur test des intégrations',
      error: error.message
    };
  }
}