'use client';

import { useState, useEffect } from 'react';

interface AnalyticsCardProps {
  portfolios: Array<{
    id: string;
    title: string;
    projects: Array<{
      id: string;
      title: string;
      featured: boolean;
      source: string | null;
      createdAt: Date;
    }>;
    _count: {
      projects: number;
    };
    updatedAt: Date;
  }>;
}

interface AnalyticsData {
  totalProjects: number;
  featuredProjects: number;
  sourceDistribution: Record<string, number>;
  recentActivity: number;
  portfolioStats: Array<{
    name: string;
    projects: number;
    featured: number;
  }>;
}

export default function AnalyticsCard({ portfolios }: AnalyticsCardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    calculateAnalytics();
  }, [portfolios]);

  const calculateAnalytics = () => {
    const totalProjects = portfolios.reduce((sum, p) => sum + p._count.projects, 0);
    const allProjects = portfolios.flatMap(p => p.projects);
    
    const featuredProjects = allProjects.filter(p => p.featured).length;
    
    // Distribution des sources
    const sourceDistribution = allProjects.reduce((acc, project) => {
      const source = project.source || 'manual';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activité récente (derniers 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = allProjects.filter(p => 
      new Date(p.createdAt) > sevenDaysAgo
    ).length;

    // Stats par portfolio
    const portfolioStats = portfolios.map(portfolio => ({
      name: portfolio.title,
      projects: portfolio._count.projects,
      featured: portfolio.projects.filter(p => p.featured).length
    }));

    setAnalytics({
      totalProjects,
      featuredProjects,
      sourceDistribution,
      recentActivity,
      portfolioStats
    });
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      github: '🐙',
      behance: '🎨',
      dribbble: '🏀',
      manual: '✏️'
    };
    return icons[source as keyof typeof icons] || '📝';
  };

  const getSourceColor = (source: string) => {
    const colors = {
      github: 'bg-gray-100 text-gray-800',
      behance: 'bg-blue-100 text-blue-800',
      dribbble: 'bg-pink-100 text-pink-800',
      manual: 'bg-green-100 text-green-800'
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Analytics
        </h3>
        <span className="text-xs text-gray-500">
          Derniers 30 jours
        </span>
      </div>

      {analytics.totalProjects === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Aucune donnée disponible
          </h4>
          <p className="text-sm text-gray-600">
            Synchronisez vos projets pour voir vos analytics
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.totalProjects}
                  </p>
                  <p className="text-xs text-blue-700">
                    Projets total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.featuredProjects}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Projets mis en avant
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.recentActivity}
                  </p>
                  <p className="text-xs text-green-700">
                    Nouveaux (7j)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {portfolios.length}
                  </p>
                  <p className="text-xs text-purple-700">
                    Portfolios
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution des sources */}
          {Object.keys(analytics.sourceDistribution).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Sources des projets
              </h4>
              <div className="space-y-2">
                {Object.entries(analytics.sourceDistribution).map(([source, count]) => {
                  const percentage = Math.round((count / analytics.totalProjects) * 100);
                  return (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-sm">
                          {getSourceIcon(source)}
                        </span>
                        <span className="text-sm text-gray-700 capitalize">
                          {source === 'manual' ? 'Ajout manuel' : source}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSourceColor(source)}`}>
                          {count}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats par portfolio */}
          {analytics.portfolioStats.length > 1 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Répartition par portfolio
              </h4>
              <div className="space-y-2">
                {analytics.portfolioStats.map((portfolio, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900">
                      {portfolio.name}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-600">
                        {portfolio.projects} projets
                      </span>
                      {portfolio.featured > 0 && (
                        <span className="text-xs text-yellow-600">
                          ⭐ {portfolio.featured}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA pour plus d'analytics */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Besoin de plus d'analytics détaillées ?
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Voir les analytics avancées →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}