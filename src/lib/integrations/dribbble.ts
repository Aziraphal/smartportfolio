export interface DribbbleShot {
  id: number;
  title: string;
  description: string | null;
  width: number;
  height: number;
  images: {
    hidpi: string | null;
    normal: string;
    teaser: string;
  };
  published_at: string;
  updated_at: string;
  html_url: string;
  attachments_url: string;
  buckets_url: string;
  comments_url: string;
  likes_url: string;
  projects_url: string;
  rebounds_url: string;
  animated: boolean;
  tags: string[];
  user: {
    id: number;
    name: string;
    username: string;
    html_url: string;
    avatar_url: string;
    bio: string | null;
    location: string | null;
    links: {
      web: string | null;
      twitter: string | null;
    };
    buckets_count: number;
    comments_received_count: number;
    followers_count: number;
    followings_count: number;
    likes_count: number;
    likes_received_count: number;
    projects_count: number;
    rebounds_received_count: number;
    shots_count: number;
    teams_count: number;
    can_upload_shot: boolean;
    type: string;
    pro: boolean;
    buckets_url: string;
    followers_url: string;
    following_url: string;
    likes_url: string;
    projects_url: string;
    shots_url: string;
    teams_url: string;
    created_at: string;
    updated_at: string;
  };
  team: any | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  attachments_count: number;
  rebounds_count: number;
  buckets_count: number;
  projects: Array<{
    id: number;
    name: string;
    description: string | null;
    shots_count: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface DribbbleUser {
  id: number;
  name: string;
  username: string;
  html_url: string;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  links: {
    web: string | null;
    twitter: string | null;
  };
  buckets_count: number;
  comments_received_count: number;
  followers_count: number;
  followings_count: number;
  likes_count: number;
  likes_received_count: number;
  projects_count: number;
  rebounds_received_count: number;
  shots_count: number;
  teams_count: number;
  can_upload_shot: boolean;
  type: string;
  pro: boolean;
  buckets_url: string;
  followers_url: string;
  following_url: string;
  likes_url: string;
  projects_url: string;
  shots_url: string;
  teams_url: string;
  created_at: string;
  updated_at: string;
}

export class DribbbleAPI {
  private baseURL = 'https://api.dribbble.com/v2';
  
  constructor(private accessToken?: string) {}

  private async request(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Dribbble API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile(username: string): Promise<DribbbleUser> {
    return this.request(`/users/${username}`);
  }

  async getUserShots(
    username: string,
    options: {
      sort?: 'recent' | 'popular' | 'views' | 'comments';
      timeframe?: 'now' | 'week' | 'month' | 'year' | 'ever';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<DribbbleShot[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/users/${username}/shots${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAuthenticatedUserShots(options: {
    sort?: 'recent' | 'popular' | 'views' | 'comments';
    timeframe?: 'now' | 'week' | 'month' | 'year' | 'ever';
    per_page?: number;
    page?: number;
  } = {}): Promise<DribbbleShot[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/user/shots${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getShot(shotId: number): Promise<DribbbleShot> {
    return this.request(`/shots/${shotId}`);
  }

  convertToProject(shot: DribbbleShot) {
    return {
      title: shot.title,
      description: shot.description || `Design créatif publié sur Dribbble`,
      originalDescription: shot.description,
      imageUrl: shot.images.hidpi || shot.images.normal,
      projectUrl: shot.html_url,
      tags: [
        ...shot.tags.slice(0, 5),
        'Dribbble',
        'Design'
      ],
      category: this.getCategoryFromTags(shot.tags),
      externalId: shot.id.toString(),
      source: 'dribbble' as const,
      featured: shot.likes_count > 100,
      order: shot.likes_count + shot.views_count
    };
  }

  private getCategoryFromTags(tags: string[]): string {
    const tagMap: Record<string, string> = {
      'ui': 'ui-ux',
      'ux': 'ui-ux',
      'web': 'web-design',
      'mobile': 'mobile-design',
      'app': 'mobile-design',
      'logo': 'branding',
      'branding': 'branding',
      'identity': 'branding',
      'illustration': 'illustration',
      'icon': 'icon-design',
      'typography': 'typography',
      'print': 'print-design',
      'poster': 'print-design',
      'packaging': 'packaging',
      'motion': 'motion-graphics',
      'animation': 'motion-graphics',
      'photography': 'photography',
      'mockup': 'mockup'
    };

    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase();
      if (tagMap[normalizedTag]) {
        return tagMap[normalizedTag];
      }
    }

    return 'design';
  }

  static getAuthURL(clientId: string, redirectUri: string, scopes: string[] = ['public']) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: Math.random().toString(36).substring(7),
      response_type: 'code'
    });

    return `https://dribbble.com/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; token_type: string; scope: string }> {
    const response = await fetch('https://dribbble.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }),
    });

    if (!response.ok) {
      throw new Error(`Dribbble OAuth error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async searchShots(
    query: string,
    options: {
      sort?: 'recent' | 'popular' | 'views' | 'comments';
      timeframe?: 'now' | 'week' | 'month' | 'year' | 'ever';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<DribbbleShot[]> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`https://api.dribbble.com/v2/shots?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Dribbble API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}