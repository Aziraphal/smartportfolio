'use client';

import { useState } from 'react';

export interface Integration {
  platform: 'github' | 'behance' | 'dribbble';
  username: string;
  connected: boolean;
}

interface IntegrationSetupProps {
  integrations: Integration[];
  onIntegrationsUpdate: (integrations: Integration[]) => void;
}

const platformConfig = {
  github: {
    name: 'GitHub',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: 'bg-gray-900',
    description: 'Importez vos repositories et projets de développement',
    placeholder: 'votre-username-github'
  },
  behance: {
    name: 'Behance',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.497 1.19.9.32 1.54.82 1.92 1.5.38.68.57 1.54.57 2.59 0 .75-.13 1.39-.4 1.93-.27.54-.65.99-1.14 1.35-.49.36-1.06.62-1.71.78-.65.16-1.36.24-2.13.24H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.84-3.08.84-.837 0-1.584-.13-2.24-.39-.66-.26-1.22-.62-1.69-1.09-.47-.48-.83-1.05-1.078-1.71-.25-.66-.376-1.39-.376-2.18 0-.83.13-1.58.39-2.25.26-.67.63-1.24 1.11-1.71.48-.47 1.05-.83 1.72-1.08.67-.25 1.4-.38 2.18-.38.86 0 1.63.16 2.3.48.67.32 1.23.77 1.67 1.35.44.58.75 1.27.93 2.07.18.8.24 1.64.18 2.52h-7.69c.03.97.32 1.66.75 2.063zm-5.478 2.593H6.668v-6.21H11.1c.835 0 1.493.213 1.977.64.484.426.726 1.04.726 1.846 0 .543-.14.99-.42 1.337-.28.348-.663.6-1.15.756-.487.156-1.03.234-1.63.234-.11 0-.24-.004-.38-.013-.14-.01-.29-.024-.45-.044-.16-.02-.31-.05-.45-.09-.14-.04-.26-.09-.35-.15zm-4.81-11.17H6.67V5.179H11.1c.463 0 .89.078 1.28.234.39.156.73.384 1.02.684.29.3.51.66.66 1.08.15.42.225.91.225 1.47 0 .69-.225 1.31-.676 1.85-.45.54-1.108.81-1.97.81H6.653v-2.37z"/>
      </svg>
    ),
    color: 'bg-blue-600',
    description: 'Synchronisez vos projets créatifs et designs',
    placeholder: 'votre-username-behance'
  },
  dribbble: {
    name: 'Dribbble',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm7.568 5.302c1.4 1.5 2.252 3.5 2.338 5.698-2.387-.506-4.54-.506-6.265-.506-.664 0-1.215.029-1.645.067-.384-1.007-.851-2.067-1.357-3.125 2.214-.935 4.041-1.822 6.929-2.134zM12 2.154c2.007 0 3.875.695 5.344 1.86-2.541.292-4.236 1.115-6.369 2.014C9.688 4.003 8.26 2.52 6.26 1.985 8.023 1.387 9.977 2.154 12 2.154zM4.862 3.297c1.977.45 3.482 1.8 4.906 4.03-1.935.435-4.006.435-6.16.435-.424 0-.854-.014-1.289-.043C2.8 6.287 3.67 4.67 4.862 3.297zm-2.7 5.29c.506.029 1.006.043 1.5.043 2.377 0 4.704 0 6.945-.435.42.958.8 1.915 1.14 2.858-2.063.348-3.824 1.044-5.353 2.116C4.57 11.467 3.565 9.565 2.162 8.587zm1.917 6.777c1.334-.87 2.734-1.334 4.348-1.624.464 1.435.8 2.9 1.044 4.393C8.084 17.067 6.757 15.33 4.08 15.063zm6.124 2.435c-.29-1.508-.638-2.987-1.116-4.436 1.334-.145 2.7-.145 4.378 0 .174 1.45.348 2.87.58 4.291C13.732 17.623 12.86 17.768 10.2 17.498zm4.348-.145c-.232-1.392-.406-2.783-.58-4.204 1.566 0 3.421.029 5.686.464-.348 1.71-1.276 3.205-2.61 4.291-.435-.145-.87-.29-1.334-.435-.435-.145-.87-.29-1.162-.116z"/>
      </svg>
    ),
    color: 'bg-pink-500',
    description: 'Connectez vos shots et designs créatifs',
    placeholder: 'votre-username-dribbble'
  }
};

export default function IntegrationSetup({ integrations, onIntegrationsUpdate }: IntegrationSetupProps) {
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  const updateIntegration = (platform: Integration['platform'], updates: Partial<Integration>) => {
    const existingIndex = integrations.findIndex(int => int.platform === platform);
    
    if (existingIndex >= 0) {
      const updated = integrations.map((int, index) => 
        index === existingIndex ? { ...int, ...updates } : int
      );
      onIntegrationsUpdate(updated);
    } else {
      onIntegrationsUpdate([...integrations, {
        platform,
        username: '',
        connected: false,
        ...updates
      }]);
    }
  };

  const testConnection = async (platform: Integration['platform'], username: string) => {
    if (!username.trim()) return;
    
    setTestingPlatform(platform);
    
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, username }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        updateIntegration(platform, { username, connected: true });
      } else {
        updateIntegration(platform, { username, connected: false });
      }
    } catch (error) {
      console.error('Test connection error:', error);
      updateIntegration(platform, { username, connected: false });
    } finally {
      setTestingPlatform(null);
    }
  };

  const getIntegration = (platform: Integration['platform']) => {
    return integrations.find(int => int.platform === platform) || 
           { platform, username: '', connected: false };
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connectez vos comptes
        </h2>
        <p className="text-gray-600">
          Importez automatiquement vos projets depuis vos plateformes préférées
        </p>
      </div>

      <div className="space-y-6">
        {(Object.keys(platformConfig) as Array<keyof typeof platformConfig>).map((platform) => {
          const config = platformConfig[platform];
          const integration = getIntegration(platform);
          const isConnected = integration.connected;
          const isTesting = testingPlatform === platform;

          return (
            <div key={platform} className={`border rounded-lg p-6 transition-all ${
              isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${config.color} text-white flex items-center justify-center mr-4`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {config.description}
                    </p>
                  </div>
                </div>
                
                {isConnected && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Connecté</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur {config.name}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={integration.username}
                    onChange={(e) => updateIntegration(platform, { username: e.target.value, connected: false })}
                    placeholder={config.placeholder}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => testConnection(platform, integration.username)}
                    disabled={!integration.username.trim() || isTesting}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !integration.username.trim() || isTesting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isConnected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isTesting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Test...
                      </div>
                    ) : isConnected ? (
                      'Retester'
                    ) : (
                      'Tester'
                    )}
                  </button>
                </div>
                
                {integration.username && !isConnected && !isTesting && (
                  <p className="mt-2 text-sm text-red-600">
                    Impossible de se connecter à ce compte. Vérifiez le nom d'utilisateur.
                  </p>
                )}
              </div>

              {/* Platform-specific tips */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600">
                  {platform === 'github' && (
                    <>💡 Nous importerons vos repositories publics les plus récents et populaires</>
                  )}
                  {platform === 'behance' && (
                    <>💡 Vos projets Behance seront synchronisés avec leurs images et descriptions</>
                  )}
                  {platform === 'dribbble' && (
                    <>💡 Nous récupérerons vos shots les plus populaires automatiquement</>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Intégrations optionnelles
            </p>
            <p className="text-sm text-blue-700">
              Vous pouvez passer cette étape et ajouter vos projets manuellement. 
              Les intégrations peuvent être configurées plus tard depuis votre dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}