import { NextRequest, NextResponse } from 'next/server'
import { GitHubAPI } from '@/lib/integrations/github'
import { BehanceAPI } from '@/lib/integrations/behance'
import { DribbbleAPI } from '@/lib/integrations/dribbble'
import { z } from 'zod'

const testSchema = z.object({
  platform: z.enum(['github', 'behance', 'dribbble']),
  username: z.string().min(1, 'Username is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { platform, username } = testSchema.parse(body)

    let result = { success: false, error: 'Unknown platform' }

    switch (platform) {
      case 'github':
        result = await testGitHubConnection(username)
        break
      case 'behance':
        result = await testBehanceConnection(username)
        break
      case 'dribbble':
        result = await testDribbbleConnection(username)
        break
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Integration test error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}

async function testGitHubConnection(username: string) {
  try {
    const github = new GitHubAPI()
    const user = await github.getUserProfile(username)
    
    const repos = await github.getUserRepositories(username, {
      sort: 'updated',
      per_page: 3
    })

    return {
      success: true,
      data: {
        profile: {
          name: user.name,
          bio: user.bio,
          followers: user.followers,
          public_repos: user.public_repos,
          avatar_url: user.avatar_url
        },
        sampleProjects: repos.slice(0, 3).map(repo => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url
        }))
      }
    }
  } catch (error) {
    console.error('GitHub test error:', error)
    return {
      success: false,
      error: 'Unable to find GitHub user or repositories'
    }
  }
}

async function testBehanceConnection(username: string) {
  try {
    const behanceApiKey = process.env.BEHANCE_API_KEY
    if (!behanceApiKey) {
      return {
        success: false,
        error: 'Behance API key not configured'
      }
    }

    const behance = new BehanceAPI(behanceApiKey)
    const user = await behance.getUserProfile(username)
    
    const projects = await behance.getUserProjects(username, {
      sort: 'published_date',
      per_page: 3
    })

    return {
      success: true,
      data: {
        profile: {
          name: user.display_name,
          location: user.location,
          company: user.company,
          occupation: user.occupation,
          followers: user.stats.followers,
          views: user.stats.views,
          avatar_url: user.images['138']
        },
        sampleProjects: projects.slice(0, 3).map(project => ({
          name: project.name,
          url: project.url,
          fields: project.fields,
          appreciations: project.stats.appreciations,
          views: project.stats.views,
          cover: project.covers?.['404']
        }))
      }
    }
  } catch (error) {
    console.error('Behance test error:', error)
    return {
      success: false,
      error: 'Unable to find Behance user or projects'
    }
  }
}

async function testDribbbleConnection(username: string) {
  try {
    const dribbble = new DribbbleAPI()
    const user = await dribbble.getUserProfile(username)
    
    const shots = await dribbble.getUserShots(username, {
      sort: 'recent',
      per_page: 3
    })

    return {
      success: true,
      data: {
        profile: {
          name: user.name,
          bio: user.bio,
          location: user.location,
          followers: user.followers_count,
          shots_count: user.shots_count,
          likes_received: user.likes_received_count,
          avatar_url: user.avatar_url
        },
        sampleProjects: shots.slice(0, 3).map(shot => ({
          title: shot.title,
          description: shot.description,
          url: shot.html_url,
          image: shot.images.normal,
          likes: shot.likes_count,
          views: shot.views_count,
          tags: shot.tags
        }))
      }
    }
  } catch (error) {
    console.error('Dribbble test error:', error)
    return {
      success: false,
      error: 'Unable to find Dribbble user or shots'
    }
  }
}