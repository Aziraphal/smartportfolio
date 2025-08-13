import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ProjectSyncService, SyncConfig } from '@/lib/integrations/sync'
import { z } from 'zod'

const syncSchema = z.object({
  portfolioId: z.string(),
  platforms: z.array(z.enum(['github', 'behance', 'dribbble'])).optional(),
  force: z.boolean().optional().default(false),
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
    const { portfolioId, platforms, force } = syncSchema.parse(body)

    // Vérifier que l'utilisateur possède ce portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        user: { email: session.user.email }
      },
      include: {
        integrations: {
          where: { isActive: true }
        }
      }
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Filtrer les intégrations selon les plateformes demandées
    const integrationsToSync = portfolio.integrations.filter(integration => 
      !platforms || platforms.includes(integration.platform as any)
    )

    if (integrationsToSync.length === 0) {
      return NextResponse.json(
        { error: 'No active integrations found for the specified platforms' },
        { status: 400 }
      )
    }

    // Préparer les configurations de sync
    const syncConfigs: SyncConfig[] = integrationsToSync.map(integration => ({
      platform: integration.platform as any,
      username: integration.username,
      accessToken: integration.accessToken || undefined,
      apiKey: getApiKeyForPlatform(integration.platform),
      settings: {
        maxProjects: 50,
        excludeForked: integration.platform === 'github',
        minStars: integration.platform === 'github' ? 0 : undefined,
        minLikes: integration.platform !== 'github' ? 0 : undefined,
        autoSync: true,
        syncInterval: 24
      }
    }))

    // Exécuter la synchronisation
    const syncService = new ProjectSyncService()
    const results = await syncService.syncAllPlatforms(syncConfigs)

    // Sauvegarder les projets en base de données
    let totalImported = 0
    const errors: string[] = []

    for (const result of results) {
      if (result.success) {
        try {
          // Mettre à jour la date de dernière sync
          await prisma.integration.updateMany({
            where: {
              portfolioId: portfolioId,
              platform: result.platform
            },
            data: { lastSync: new Date() }
          })

          totalImported += result.projectsImported
        } catch (error) {
          console.error(`Error saving ${result.platform} sync result:`, error)
          errors.push(`Failed to save ${result.platform} projects`)
        }
      } else {
        errors.push(...result.errors)
      }
    }

    return NextResponse.json({
      success: true,
      totalImported,
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Sync error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    // Récupérer les statuts de sync
    const integrations = await prisma.integration.findMany({
      where: {
        portfolioId,
        portfolio: {
          user: { email: session.user.email }
        }
      },
      select: {
        id: true,
        platform: true,
        username: true,
        lastSync: true,
        isActive: true,
        settings: true
      }
    })

    const syncStatus = integrations.map(integration => ({
      platform: integration.platform,
      username: integration.username,
      lastSync: integration.lastSync,
      isActive: integration.isActive,
      nextSync: integration.lastSync && integration.settings && 
        typeof integration.settings === 'object' && 
        'syncInterval' in integration.settings
          ? new Date(integration.lastSync.getTime() + (integration.settings.syncInterval as number) * 60 * 60 * 1000)
          : null
    }))

    return NextResponse.json({ integrations: syncStatus })

  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
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