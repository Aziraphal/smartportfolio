export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  fork: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export class GitHubAPI {
  private baseURL = 'https://api.github.com';
  
  constructor(private accessToken?: string) {}

  private async request(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SmartPortfolio/1.0'
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile(username: string): Promise<GitHubUser> {
    return this.request(`/users/${username}`);
  }

  async getUserRepositories(
    username: string, 
    options: {
      type?: 'owner' | 'member' | 'all';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/users/${username}/repos${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAuthenticatedUserRepos(options: {
    visibility?: 'all' | 'public' | 'private';
    affiliation?: 'owner' | 'collaborator' | 'organization_member';
    type?: 'owner' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/user/repos${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  convertToProject(repo: GitHubRepository) {
    return {
      title: repo.name,
      description: repo.description || `Projet ${repo.language || 'développement'} sur GitHub`,
      originalDescription: repo.description,
      projectUrl: repo.html_url,
      sourceUrl: repo.html_url,
      tags: [
        ...(repo.language ? [repo.language] : []),
        ...repo.topics.slice(0, 5),
        'GitHub'
      ],
      category: this.getCategoryFromLanguage(repo.language),
      externalId: repo.id.toString(),
      source: 'github' as const,
      featured: repo.stargazers_count > 10,
      order: repo.stargazers_count
    };
  }

  private getCategoryFromLanguage(language: string | null): string {
    if (!language) return 'development';
    
    const languageMap: Record<string, string> = {
      'JavaScript': 'web-development',
      'TypeScript': 'web-development',
      'React': 'web-development',
      'Vue': 'web-development',
      'Angular': 'web-development',
      'HTML': 'web-development',
      'CSS': 'web-development',
      'SCSS': 'web-development',
      'Python': 'backend-development',
      'Java': 'backend-development',
      'C#': 'backend-development',
      'Go': 'backend-development',
      'Rust': 'backend-development',
      'PHP': 'backend-development',
      'Ruby': 'backend-development',
      'Swift': 'mobile-development',
      'Kotlin': 'mobile-development',
      'Dart': 'mobile-development',
      'Flutter': 'mobile-development',
      'C++': 'system-programming',
      'C': 'system-programming',
      'Shell': 'devops',
      'Dockerfile': 'devops',
      'YAML': 'devops'
    };

    return languageMap[language] || 'development';
  }

  static getAuthURL(clientId: string, redirectUri: string, scopes: string[] = ['repo']) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: Math.random().toString(36).substring(7)
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string
  ): Promise<{ access_token: string; token_type: string; scope: string }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub OAuth error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}