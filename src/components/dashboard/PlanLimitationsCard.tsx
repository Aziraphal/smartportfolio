'use client';

import { useState, useEffect } from 'react';
import { LimitationStatus } from '@/lib/limitations/plan-limiter';
import { formatLimitationStatus, getLimitationColor, getLimitationBgColor } from '@/lib/limitations/middleware';
import UpgradeModal from '@/components/pricing/UpgradeModal';

interface PlanLimitationsCardProps {
  currentPlan: string;
}

export default function PlanLimitationsCard({ currentPlan }: PlanLimitationsCardProps) {
  const [status, setStatus] = useState<LimitationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchLimitationStatus();
  }, []);

  const fetchLimitationStatus = async () => {
    try {
      const response = await fetch('/api/plan/check-limitation');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Erreur récupération limitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return '∞';
    return limit.toString();
  };

  const getProgressWidth = (used: number, limit: number) => {
    if (limit === -1) return 5; // Petit indicateur pour illimité
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-4">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">
            Impossible de récupérer les limitations
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Utilisation & Limites
          </h3>
          {currentPlan === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Upgrader →
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Projets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Projets
              </span>
              <span className={`text-sm font-medium ${getLimitationColor(status.projects.percentage)}`}>
                {formatLimitationStatus(
                  status.projects.used,
                  status.projects.limit,
                  status.projects.limit === -1
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.projects.percentage)}`}
                style={{ width: `${getProgressWidth(status.projects.used, status.projects.limit)}%` }}
              />
            </div>
            {status.projects.percentage >= 80 && status.projects.limit !== -1 && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Limite bientôt atteinte
              </p>
            )}
          </div>

          {/* Intégrations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Intégrations
              </span>
              <span className={`text-sm font-medium ${getLimitationColor(status.integrations.percentage)}`}>
                {formatLimitationStatus(
                  status.integrations.used,
                  status.integrations.limit,
                  status.integrations.limit === -1
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.integrations.percentage)}`}
                style={{ width: `${getProgressWidth(status.integrations.used, status.integrations.limit)}%` }}
              />
            </div>
          </div>

          {/* Portfolios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Portfolios
              </span>
              <span className={`text-sm font-medium ${getLimitationColor(status.portfolios.percentage)}`}>
                {formatLimitationStatus(
                  status.portfolios.used,
                  status.portfolios.limit,
                  status.portfolios.limit === -1
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.portfolios.percentage)}`}
                style={{ width: `${getProgressWidth(status.portfolios.used, status.portfolios.limit)}%` }}
              />
            </div>
          </div>

          {/* Optimisations IA */}
          {currentPlan !== 'free' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Optimisations IA
                </span>
                <span className={`text-sm font-medium ${getLimitationColor(status.aiOptimizations.percentage)}`}>
                  {formatLimitationStatus(
                    status.aiOptimizations.used,
                    status.aiOptimizations.limit,
                    status.aiOptimizations.limit === -1
                  )} / mois
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.aiOptimizations.percentage)}`}
                  style={{ width: `${getProgressWidth(status.aiOptimizations.used, status.aiOptimizations.limit)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stockage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Stockage
              </span>
              <span className={`text-sm font-medium ${getLimitationColor(status.storage.percentage)}`}>
                {status.storage.used} MB / {formatLimit(status.storage.limit)} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.storage.percentage)}`}
                style={{ width: `${status.storage.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Fonctionnalités disponibles
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${status.features.customDomain ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={status.features.customDomain ? 'text-gray-900' : 'text-gray-500'}>
                Domaine personnalisé
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${status.features.cvGeneration ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={status.features.cvGeneration ? 'text-gray-900' : 'text-gray-500'}>
                Génération CV
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${status.features.analytics ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={status.features.analytics ? 'text-gray-900' : 'text-gray-500'}>
                Analytics avancées
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${status.features.prioritySupport ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={status.features.prioritySupport ? 'text-gray-900' : 'text-gray-500'}>
                Support prioritaire
              </span>
            </div>
          </div>
        </div>

        {/* Alertes si proche des limites */}
        {currentPlan === 'free' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="text-sm font-medium text-blue-900">
                  Passez au plan Pro
                </h5>
                <p className="text-sm text-blue-800 mt-1">
                  Débloquez les intégrations illimitées, l'IA SEO, et bien plus.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-2 text-sm font-medium text-blue-800 underline hover:no-underline"
                >
                  Voir les plans →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
      />
    </>
  );
}