'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubscriptionService } from '@/lib/subscription/plans';

interface PortfolioOverviewProps {
  portfolios: Array<{
    id: string;
    title: string;
    description: string | null;
    subdomain: string | null;
    customDomain: string | null;
    isPublic: boolean;
    projects: Array<{
      id: string;
      title: string;
      featured: boolean;
      source: string | null;
      createdAt: Date;
    }>;
    integrations: Array<{
      platform: string;
      isActive: boolean;
      lastSync: Date | null;
    }>;
    _count: {
      projects: number;
    };
    updatedAt: Date;
  }>;
  currentPlan: string;
}

export default function PortfolioOverview({ portfolios, currentPlan }: PortfolioOverviewProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(
    portfolios.length > 0 ? portfolios[0].id : null
  );

  const activePortfolio = portfolios.find(p => p.id === selectedPortfolio) || portfolios[0];

  const canCreateMore = () => {
    const limits = SubscriptionService.getUsageLimits(null); // TODO: pass real subscription
    if (currentPlan === 'free') {
      return portfolios.length < 1; // Plan gratuit: 1 portfolio max
    }
    if (currentPlan === 'team') {
      return portfolios.length < 5; // Plan équipe: 5 portfolios max
    }
    return true; // Plan pro: illimité
  };

  const getPortfolioUrl = (portfolio: any) => {
    if (portfolio.customDomain) {
      return `https://${portfolio.customDomain}`;
    }
    if (portfolio.subdomain) {
      return `https://${portfolio.subdomain}.smartportfolio.com`;
    }
    return '#';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Mes Portfolios
          </h2>
          {canCreateMore() ? (
            <Link
              href="/create"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Portfolio
            </Link>
          ) : (
            <span className="text-sm text-gray-500">
              Limite atteinte ({currentPlan === 'free' ? '1' : '5'} portfolios max)
            </span>
          )}
        </div>
      </div>

      {portfolios.length === 0 ? (
        <div className="p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun portfolio créé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier portfolio professionnel
          </p>
          <Link
            href="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Créer mon portfolio
          </Link>
        </div>
      ) : (
        <div className="p-6">
          {/* Sélecteur de portfolio si plusieurs */}
          {portfolios.length > 1 && (
            <div className="mb-6">
              <label htmlFor="portfolio-select" className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio actuel
              </label>
              <select
                id="portfolio-select"
                value={selectedPortfolio || ''}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activePortfolio && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations principales */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {activePortfolio.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activePortfolio.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activePortfolio.isPublic ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                </div>

                {activePortfolio.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    {activePortfolio.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {activePortfolio.customDomain || `${activePortfolio.subdomain}.smartportfolio.com`}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {activePortfolio._count.projects} projets
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mis à jour {formatDate(activePortfolio.updatedAt)}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <a
                    href={getPortfolioUrl(activePortfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Voir
                  </a>
                  <Link
                    href={`/dashboard/portfolios/${activePortfolio.id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </Link>
                </div>
              </div>

              {/* Projets récents */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Projets récents
                </h4>
                {activePortfolio.projects.length === 0 ? (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      Aucun projet synchronisé
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-500">
                      Synchroniser maintenant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePortfolio.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h5 className="text-sm font-medium text-gray-900">
                              {project.title}
                            </h5>
                            {project.featured && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {project.source} • {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activePortfolio._count.projects > 5 && (
                      <div className="text-center">
                        <Link
                          href={`/dashboard/portfolios/${activePortfolio.id}/projects`}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Voir tous les projets ({activePortfolio._count.projects})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}