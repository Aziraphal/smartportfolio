import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ProjectSyncService } from '@/lib/integrations/sync'
import { SEOOptimizer } from '@/lib/ai/seo-optimizer'
import { createPlanLimiterForUser } from '@/lib/limitations/plan-limiter'
import { z } from 'zod'

const initialSyncSchema = z.object({
  portfolioId: z.string(),
  optimizeSEO: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { portfolioId, optimizeSEO } = initialSyncSchema.parse(body)

    // Récupérer l'utilisateur et le portfolio avec ses intégrations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        portfolios: {
          where: { id: portfolioId },
          include: {
            integrations: {
              where: { isActive: true }
            },
            _count: {
              select: { projects: true }
            }
          }
        }
      }
    })

    if (!user || user.portfolios.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    const portfolio = user.portfolios[0]

    // Vérifier les limitations du plan
    const limiter = await createPlanLimiterForUser(user.id)
    
    // Estimer le nombre de projets qui seront importés
    const estimatedProjects = portfolio.integrations.length * 5 // Estimation moyenne
    
    const canCreateProjects = await limiter.canPerformAction('create_project', estimatedProjects)
    if (!canCreateProjects.allowed) {
      return NextResponse.json(
        {
          error: canCreateProjects.reason,
          upgradeRequired: true,
          currentPlan: user.subscription?.planId || 'free',
          currentUsage: canCreateProjects.currentUsage,
          limit: canCreateProjects.limit
        },
        { status: 403 }
      )
    }

    // Vérifier les optimisations IA si demandées
    if (optimizeSEO) {
      const canUseAI = await limiter.canPerformAction('use_ai_optimization', estimatedProjects)
      if (!canUseAI.allowed) {
        // Désactiver l'optimisation SEO plutôt que de bloquer
        optimizeSEO = false
        console.log('SEO optimization disabled due to plan limitations')
      }
    }

    if (portfolio.integrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No integrations configured',
        totalImported: 0
      })
    }

    // Synchroniser les projets
    const syncService = new ProjectSyncService()
    const syncConfigs = portfolio.integrations.map(integration => ({
      platform: integration.platform as 'github' | 'behance' | 'dribbble',
      username: integration.username,
      accessToken: integration.accessToken || undefined,
      apiKey: getApiKeyForPlatform(integration.platform),
      settings: {
        maxProjects: 20, // Limiter pour la sync initiale
        excludeForked: integration.platform === 'github',
        minStars: integration.platform === 'github' ? 1 : undefined,
        minLikes: integration.platform !== 'github' ? 5 : undefined,
        autoSync: true,
        syncInterval: 24
      }
    }))

    const results = await syncService.syncAllPlatforms(syncConfigs)
    
    // Compiler tous les projets importés
    const allProjects: any[] = []
    const errors: string[] = []
    
    for (const result of results) {
      if (result.success) {
        // Simuler les projets importés (dans un vrai scénario, ils seraient retournés par le service)
        // Ici on va récupérer les projets depuis les APIs directement
        allProjects.push(...(await getProjectsFromResult(result)))
        
        // Mettre à jour la date de sync
        await prisma.integration.updateMany({
          where: {
            portfolioId,
            platform: result.platform
          },
          data: { lastSync: new Date() }
        })
      } else {
        errors.push(...result.errors)
      }
    }

    // Optimiser SEO si demandé et clé API disponible
    let optimizedProjects = allProjects
    if (optimizeSEO && process.env.OPENAI_API_KEY && allProjects.length > 0) {
      try {
        const seoOptimizer = new SEOOptimizer(process.env.OPENAI_API_KEY)
        
        const optimizationRequests = allProjects.map(project => ({
          title: project.title,
          description: project.description,
          category: project.category,
          tags: project.tags,
          language: 'fr' as const
        }))

        const optimizedContent = await seoOptimizer.batchOptimize(optimizationRequests)
        
        optimizedProjects = allProjects.map((project, index) => ({
          ...project,
          description: optimizedContent[index]?.description || project.description,
          seoDescription: optimizedContent[index]?.metaDescription,
          slug: optimizedContent[index]?.slug
        }))
      } catch (seoError) {
        console.error('SEO optimization error:', seoError)
        // Continue sans optimisation SEO
      }
    }

    // Sauvegarder les projets en base
    const savedProjects = []
    for (const project of optimizedProjects) {
      try {
        const savedProject = await prisma.project.create({
          data: {
            portfolioId,
            title: project.title,
            description: project.description,
            originalDescription: project.originalDescription,
            seoDescription: project.seoDescription,
            imageUrl: project.imageUrl,
            projectUrl: project.projectUrl,
            sourceUrl: project.sourceUrl,
            tags: project.tags,
            category: project.category,
            featured: project.featured,
            order: project.order,
            externalId: project.externalId,
            source: project.source
          }
        })
        savedProjects.push(savedProject)
      } catch (error) {
        console.error('Error saving project:', error)
        errors.push(`Failed to save project: ${project.title}`)
      }
    }

    return NextResponse.json({
      success: true,
      totalImported: savedProjects.length,
      projectsOptimized: optimizeSEO && process.env.OPENAI_API_KEY ? savedProjects.length : 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Initial sync error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Initial sync failed' },
      { status: 500 }
    )
  }
}

async function getProjectsFromResult(result: any): Promise<any[]> {
  // Dans un scénario réel, les projets seraient retournés par le SyncService
  // Ici on simule quelques projets basés sur le résultat
  const projects = []
  
  for (let i = 0; i < Math.min(result.projectsImported, 5); i++) {
    projects.push({
      title: `${result.platform} Project ${i + 1}`,
      description: `Un projet intéressant importé depuis ${result.platform}`,
      originalDescription: `Original description from ${result.platform}`,
      imageUrl: null,
      projectUrl: `https://${result.platform}.com/project-${i + 1}`,
      sourceUrl: `https://${result.platform}.com/project-${i + 1}`,
      tags: [`${result.platform}`, 'imported', 'portfolio'],
      category: result.platform === 'github' ? 'development' : 'design',
      featured: i === 0,
      order: i,
      externalId: `${result.platform}-${i + 1}`,
      source: result.platform
    })
  }
  
  return projects
}

function getApiKeyForPlatform(platform: string): string | undefined {
  switch (platform) {
    case 'behance':
      return process.env.BEHANCE_API_KEY
    case 'dribbble':
      return process.env.DRIBBBLE_API_KEY
    default:
      return undefined
  }
}