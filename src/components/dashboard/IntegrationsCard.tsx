'use client';

import { useState, useEffect } from 'react';
import { SubscriptionService } from '@/lib/subscription/plans';
import UpgradeModal from '@/components/pricing/UpgradeModal';

interface IntegrationsCardProps {
  portfolios: Array<{
    id: string;
    title: string;
    integrations: Array<{
      platform: string;
      isActive: boolean;
      lastSync: Date | null;
    }>;
  }>;
  currentPlan: string;
}

interface PlatformStatus {
  platform: string;
  name: string;
  icon: string;
  isConnected: boolean;
  lastSync: Date | null;
  isActive: boolean;
  color: string;
}

export default function IntegrationsCard({ portfolios, currentPlan }: IntegrationsCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const getAllIntegrations = (): PlatformStatus[] => {
    const platforms = ['github', 'behance', 'dribbble'];
    const connectedIntegrations = portfolios.flatMap(p => p.integrations);

    return platforms.map(platform => {
      const integration = connectedIntegrations.find(i => i.platform === platform);
      return {
        platform,
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        icon: getPlatformIcon(platform),
        isConnected: !!integration,
        lastSync: integration?.lastSync || null,
        isActive: integration?.isActive || false,
        color: getPlatformColor(platform)
      };
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      github: '🐙',
      behance: '🎨',
      dribbble: '🏀'
    };
    return icons[platform as keyof typeof icons] || '🔗';
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      github: 'border-gray-300 text-gray-700',
      behance: 'border-blue-300 text-blue-700',
      dribbble: 'border-pink-300 text-pink-700'
    };
    return colors[platform as keyof typeof colors] || 'border-gray-300 text-gray-700';
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  const testConnection = async (platform: string) => {
    if (!canAddIntegration()) {
      setShowUpgradeModal(true);
      return;
    }

    setTestingConnection(platform);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Connexion ${platform} réussie !`);
      } else {
        alert(`Erreur connexion ${platform}: ${result.error}`);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      alert(`Erreur lors du test de connexion ${platform}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const canAddIntegration = () => {
    const connectedCount = getAllIntegrations().filter(i => i.isConnected).length;
    if (currentPlan === 'free') {
      return connectedCount < 2; // Plan gratuit: 2 intégrations max
    }
    return true; // Plans Pro et Team: illimité
  };

  const integrations = getAllIntegrations();
  const connectedCount = integrations.filter(i => i.isConnected).length;
  const maxIntegrations = currentPlan === 'free' ? 2 : '∞';

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Intégrations
          </h3>
          <span className="text-sm text-gray-500">
            {connectedCount}/{maxIntegrations}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Connectez vos comptes pour synchroniser automatiquement vos projets
        </p>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.platform}
              className={`flex items-center justify-between p-4 border-2 border-dashed rounded-lg ${
                integration.isConnected 
                  ? 'border-green-200 bg-green-50' 
                  : integration.color.replace('text-', 'border-').replace('border-gray-300', 'border-gray-200')
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg border">
                  {integration.icon}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {integration.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {integration.isConnected ? (
                      <>
                        <span className="text-green-600">● Connecté</span>
                        {' • Dernière sync: ' + formatLastSync(integration.lastSync)}
                      </>
                    ) : (
                      'Non connecté'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {integration.isConnected ? (
                  <>
                    <button
                      onClick={() => testConnection(integration.platform)}
                      disabled={testingConnection === integration.platform}
                      className="text-xs text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                    >
                      {testingConnection === integration.platform ? 'Test...' : 'Tester'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-xs text-red-600 hover:text-red-500 font-medium">
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => testConnection(integration.platform)}
                    disabled={testingConnection === integration.platform || !canAddIntegration()}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingConnection === integration.platform ? 'Connexion...' : 'Connecter'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Limitation plan gratuit */}
        {currentPlan === 'free' && connectedCount >= 2 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.635 0L3.18 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Limite atteinte
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Le plan gratuit permet 2 intégrations maximum. Passez au plan Pro pour des intégrations illimitées.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-2 text-sm font-medium text-yellow-800 underline hover:no-underline"
                >
                  Passer au plan Pro →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guide d'intégration */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            💡 Comment ça marche ?
          </h5>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>GitHub:</strong> Récupère vos repositories publics</li>
            <li>• <strong>Behance:</strong> Synchronise vos projets créatifs</li>
            <li>• <strong>Dribbble:</strong> Importe vos shots design</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            La synchronisation est automatique et se fait toutes les 24h.
          </p>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        feature="Intégrations illimitées"
      />
    </>
  );
}