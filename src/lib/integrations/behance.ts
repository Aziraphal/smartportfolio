export interface BehanceProject {
  id: number;
  name: string;
  published_on: number;
  created_on: number;
  modified_on: number;
  url: string;
  privacy: string;
  fields: string[];
  covers: {
    '230': string;
    '404': string;
    '808': string;
    'max_808': string;
    'original': string;
  };
  mature_content: number;
  owners: Array<{
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    city: string;
    country: string;
    location: string;
    company: string;
    occupation: string;
    created_on: number;
    url: string;
    images: {
      '50': string;
      '100': string;
      '115': string;
      '138': string;
      '230': string;
    };
    display_name: string;
    fields: string[];
    has_default_image: number;
    subscription_status: string;
    features: {
      private_profile: number;
    };
    stats: {
      followers: number;
      following: number;
      appreciations: number;
      views: number;
      comments: number;
    };
  }>;
  stats: {
    views: number;
    appreciations: number;
    comments: number;
  };
  conceived_on: number;
  canvas_width: number;
  tags: string[];
}

export interface BehanceUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  city: string;
  country: string;
  location: string;
  company: string;
  occupation: string;
  created_on: number;
  url: string;
  images: {
    '50': string;
    '100': string;
    '115': string;
    '138': string;
    '230': string;
  };
  display_name: string;
  fields: string[];
  has_default_image: number;
  subscription_status: string;
  features: {
    private_profile: number;
  };
  stats: {
    followers: number;
    following: number;
    appreciations: number;
    views: number;
    comments: number;
  };
  sections: {
    [key: string]: string;
  };
  social_links: Array<{
    service_name: string;
    url: string;
  }>;
}

export interface BehanceProjectDetail extends BehanceProject {
  description: string;
  text_content: string;
  modules: Array<{
    type: string;
    text?: string;
    text_plain?: string;
    src?: string;
    sizes?: {
      disp: string;
      max_1240: string;
      max_1920: string;
      original: string;
    };
  }>;
  tools: Array<{
    id: number;
    title: string;
    category: string;
  }>;
  colors: Array<{
    r: number;
    g: number;
    b: number;
    hex: string;
  }>;
}

export class BehanceAPI {
  private baseURL = 'https://www.behance.net/v2';
  
  constructor(private apiKey: string) {}

  private async request(endpoint: string): Promise<any> {
    const url = `${this.baseURL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Behance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getUserProfile(username: string): Promise<BehanceUser> {
    const response = await this.request(`/users/${username}`);
    return response.user;
  }

  async getUserProjects(
    username: string,
    options: {
      sort?: 'created_date' | 'modified_date' | 'published_date' | 'appreciations' | 'views' | 'comments';
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<BehanceProject[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/users/${username}/projects${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(endpoint);
    return response.projects;
  }

  async getProject(projectId: number): Promise<BehanceProjectDetail> {
    const response = await this.request(`/projects/${projectId}`);
    return response.project;
  }

  convertToProject(project: BehanceProject) {
    const description = this.extractDescription(project);
    
    return {
      title: project.name,
      description: description || `Projet créatif publié sur Behance`,
      originalDescription: description,
      imageUrl: project.covers?.['404'] || project.covers?.['230'],
      projectUrl: project.url,
      tags: [
        ...project.tags.slice(0, 5),
        ...project.fields.slice(0, 3),
        'Behance'
      ],
      category: this.getCategoryFromFields(project.fields),
      externalId: project.id.toString(),
      source: 'behance' as const,
      featured: project.stats.appreciations > 50,
      order: project.stats.appreciations + project.stats.views
    };
  }

  private extractDescription(project: BehanceProject): string {
    return `Projet créatif dans les domaines: ${project.fields.join(', ')}. ${project.stats.appreciations} appréciations, ${project.stats.views} vues.`;
  }

  private getCategoryFromFields(fields: string[]): string {
    const fieldMap: Record<string, string> = {
      'Graphic Design': 'graphic-design',
      'Web Design': 'web-design',
      'UI/UX': 'ui-ux',
      'Branding': 'branding',
      'Illustration': 'illustration',
      'Photography': 'photography',
      'Motion Graphics': 'motion-graphics',
      'Art Direction': 'art-direction',
      'Architecture': 'architecture',
      'Fashion': 'fashion',
      'Industrial Design': 'industrial-design',
      'Interaction Design': 'interaction-design',
      'Product Design': 'product-design',
      'Packaging': 'packaging'
    };

    for (const field of fields) {
      if (fieldMap[field]) {
        return fieldMap[field];
      }
    }

    return 'design';
  }

  async getProjectWithDetails(projectId: number) {
    const project = await this.getProject(projectId);
    
    let detailedDescription = project.description || project.text_content || '';
    
    if (project.modules) {
      const textModules = project.modules
        .filter(module => module.type === 'text' && module.text_plain)
        .map(module => module.text_plain)
        .join(' ');
      
      if (textModules) {
        detailedDescription = textModules.substring(0, 500);
      }
    }

    return {
      ...this.convertToProject(project),
      description: detailedDescription || this.extractDescription(project),
      tools: project.tools?.map(tool => tool.title) || [],
      colors: project.colors?.map(color => color.hex) || []
    };
  }

  static async searchProjects(
    apiKey: string,
    query: string,
    options: {
      sort?: 'created_date' | 'modified_date' | 'published_date' | 'appreciations' | 'views' | 'comments';
      time?: 'all' | 'today' | 'week' | 'month' | 'year';
      field?: string;
      country?: string;
      state?: string;
      city?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<BehanceProject[]> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const url = `https://www.behance.net/v2/projects?${params.toString()}&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Behance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.projects;
  }
}