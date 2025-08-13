import { GitHubAPI, GitHubRepository } from './github';
import { BehanceAPI, BehanceProject } from './behance';
import { DribbbleAPI, DribbbleShot } from './dribbble';

export interface SyncConfig {
  platform: 'github' | 'behance' | 'dribbble';
  username: string;
  accessToken?: string;
  apiKey?: string;
  settings: {
    maxProjects?: number;
    excludeForked?: boolean;
    minStars?: number;
    minLikes?: number;
    categories?: string[];
    autoSync?: boolean;
    syncInterval?: number; // en heures
  };
}

export interface SyncResult {
  platform: string;
  success: boolean;
  projectsFound: number;
  projectsImported: number;
  errors: string[];
  lastSync: Date;
}

export interface Project {
  title: string;
  description: string;
  originalDescription?: string;
  imageUrl?: string;
  projectUrl?: string;
  sourceUrl?: string;
  tags: string[];
  category: string;
  featured: boolean;
  order: number;
  externalId: string;
  source: 'github' | 'behance' | 'dribbble' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectSyncService {
  async syncGitHubProjects(config: SyncConfig): Promise<SyncResult> {
    const result: SyncResult = {
      platform: 'github',
      success: false,
      projectsFound: 0,
      projectsImported: 0,
      errors: [],
      lastSync: new Date()
    };

    try {
      const github = new GitHubAPI(config.accessToken);
      
      let repositories: GitHubRepository[];
      
      if (config.accessToken) {
        repositories = await github.getAuthenticatedUserRepos({
          type: 'owner',
          sort: 'updated',
          per_page: config.settings.maxProjects || 50
        });
      } else {
        repositories = await github.getUserRepositories(config.username, {
          type: 'owner',
          sort: 'updated',
          per_page: config.settings.maxProjects || 50
        });
      }

      result.projectsFound = repositories.length;

      // Filtrer selon les critères
      const filteredRepos = repositories.filter(repo => {
        if (config.settings.excludeForked && repo.fork) return false;
        if (config.settings.minStars && repo.stargazers_count < config.settings.minStars) return false;
        if (repo.archived) return false;
        return true;
      });

      const projects: Project[] = filteredRepos.map(repo => ({
        ...github.convertToProject(repo),
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at)
      }));

      result.projectsImported = projects.length;
      result.success = true;

      // Ici vous pourriez sauvegarder les projets en base de données
      console.log(`Importé ${projects.length} projets depuis GitHub`);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur inconnue');
    }

    return result;
  }

  async syncBehanceProjects(config: SyncConfig): Promise<SyncResult> {
    const result: SyncResult = {
      platform: 'behance',
      success: false,
      projectsFound: 0,
      projectsImported: 0,
      errors: [],
      lastSync: new Date()
    };

    try {
      if (!config.apiKey) {
        throw new Error('Clé API Behance requise');
      }

      const behance = new BehanceAPI(config.apiKey);
      
      const behanceProjects = await behance.getUserProjects(config.username, {
        sort: 'published_date',
        per_page: config.settings.maxProjects || 50
      });

      result.projectsFound = behanceProjects.length;

      // Filtrer selon les critères
      const filteredProjects = behanceProjects.filter(project => {
        if (config.settings.minLikes && project.stats.appreciations < config.settings.minLikes) return false;
        return true;
      });

      const projects: Project[] = filteredProjects.map(project => ({
        ...behance.convertToProject(project),
        createdAt: new Date(project.created_on * 1000),
        updatedAt: new Date(project.modified_on * 1000)
      }));

      result.projectsImported = projects.length;
      result.success = true;

      console.log(`Importé ${projects.length} projets depuis Behance`);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur inconnue');
    }

    return result;
  }

  async syncDribbbleProjects(config: SyncConfig): Promise<SyncResult> {
    const result: SyncResult = {
      platform: 'dribbble',
      success: false,
      projectsFound: 0,
      projectsImported: 0,
      errors: [],
      lastSync: new Date()
    };

    try {
      const dribbble = new DribbbleAPI(config.accessToken);
      
      let shots: DribbbleShot[];
      
      if (config.accessToken) {
        shots = await dribbble.getAuthenticatedUserShots({
          sort: 'recent',
          per_page: config.settings.maxProjects || 50
        });
      } else {
        shots = await dribbble.getUserShots(config.username, {
          sort: 'recent',
          per_page: config.settings.maxProjects || 50
        });
      }

      result.projectsFound = shots.length;

      // Filtrer selon les critères
      const filteredShots = shots.filter(shot => {
        if (config.settings.minLikes && shot.likes_count < config.settings.minLikes) return false;
        return true;
      });

      const projects: Project[] = filteredShots.map(shot => ({
        ...dribbble.convertToProject(shot),
        createdAt: new Date(shot.published_at),
        updatedAt: new Date(shot.updated_at)
      }));

      result.projectsImported = projects.length;
      result.success = true;

      console.log(`Importé ${projects.length} projets depuis Dribbble`);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur inconnue');
    }

    return result;
  }

  async syncAllPlatforms(configs: SyncConfig[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const config of configs) {
      let result: SyncResult;
      
      switch (config.platform) {
        case 'github':
          result = await this.syncGitHubProjects(config);
          break;
        case 'behance':
          result = await this.syncBehanceProjects(config);
          break;
        case 'dribbble':
          result = await this.syncDribbbleProjects(config);
          break;
        default:
          result = {
            platform: config.platform,
            success: false,
            projectsFound: 0,
            projectsImported: 0,
            errors: ['Plateforme non supportée'],
            lastSync: new Date()
          };
      }
      
      results.push(result);
    }

    return results;
  }

  async scheduleSync(configs: SyncConfig[]): Promise<void> {
    // Implémentation pour planifier les synchronisations automatiques
    // Ceci pourrait utiliser node-cron ou être géré côté serveur
    console.log('Planification des synchronisations automatiques');
    
    for (const config of configs) {
      if (config.settings.autoSync && config.settings.syncInterval) {
        const intervalMs = config.settings.syncInterval * 60 * 60 * 1000; // heures en ms
        
        setInterval(async () => {
          console.log(`Synchronisation automatique: ${config.platform} - ${config.username}`);
          
          switch (config.platform) {
            case 'github':
              await this.syncGitHubProjects(config);
              break;
            case 'behance':
              await this.syncBehanceProjects(config);
              break;
            case 'dribbble':
              await this.syncDribbbleProjects(config);
              break;
          }
        }, intervalMs);
      }
    }
  }

  // Méthodes utilitaires
  static validateConfig(config: SyncConfig): boolean {
    if (!config.username) return false;
    
    switch (config.platform) {
      case 'behance':
        return !!config.apiKey;
      case 'dribbble':
        // Dribbble peut fonctionner sans token pour les données publiques
        return true;
      case 'github':
        // GitHub peut fonctionner sans token pour les repos publics
        return true;
      default:
        return false;
    }
  }

  static getDefaultSettings() {
    return {
      maxProjects: 50,
      excludeForked: true,
      minStars: 0,
      minLikes: 0,
      categories: [],
      autoSync: false,
      syncInterval: 24 // 24 heures par défaut
    };
  }
}