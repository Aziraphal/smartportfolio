'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export default function TestPage() {
  const { data: session, status } = useSession();
  const [integrationTests, setIntegrationTests] = useState<TestResult | null>(null);
  const [onboardingTests, setOnboardingTests] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const runIntegrationTests = async () => {
    setLoading({ ...loading, integration: true });
    try {
      const response = await fetch('/api/test/integration');
      const result = await response.json();
      setIntegrationTests(result);
    } catch (error) {
      setIntegrationTests({
        success: false,
        message: 'Erreur lors des tests d\'intégration',
        details: error.message
      });
    } finally {
      setLoading({ ...loading, integration: false });
    }
  };

  const runOnboardingTests = async () => {
    setLoading({ ...loading, onboarding: true });
    try {
      const response = await fetch('/api/test/onboarding-flow', {
        method: 'POST'
      });
      const result = await response.json();
      setOnboardingTests(result);
    } catch (error) {
      setOnboardingTests({
        success: false,
        message: 'Erreur lors des tests d\'onboarding',
        details: error.message
      });
    } finally {
      setLoading({ ...loading, onboarding: false });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Tests SmartPortfolio
            </h2>
            <p className="text-gray-600 mb-4">
              Authentification requise pour accéder aux tests
            </p>
            <button
              onClick={() => signIn()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Tests SmartPortfolio
            </h1>
            <p className="text-gray-600 mt-1">
              Validation des fonctionnalités avant mise en production
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Tests d'intégration */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tests d'intégration
                  </h2>
                  <p className="text-sm text-gray-600">
                    Vérifie la base de données, les services et les APIs
                  </p>
                </div>
                <button
                  onClick={runIntegrationTests}
                  disabled={loading.integration}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.integration ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Test en cours...
                    </>
                  ) : (
                    'Lancer les tests'
                  )}
                </button>
              </div>

              {integrationTests && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  integrationTests.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {integrationTests.success ? (
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`font-medium ${
                      integrationTests.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {integrationTests.message}
                    </span>
                  </div>
                  
                  {integrationTests.results && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Détails:</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(integrationTests.results).map(([key, result]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="capitalize">{key}:</span>
                            <span className={`font-medium ${
                              result.success ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.success ? '✅' : '❌'} {result.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tests d'onboarding */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tests du flow d'onboarding
                  </h2>
                  <p className="text-sm text-gray-600">
                    Simule le parcours complet d'un nouvel utilisateur
                  </p>
                </div>
                <button
                  onClick={runOnboardingTests}
                  disabled={loading.onboarding}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.onboarding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Test en cours...
                    </>
                  ) : (
                    'Simuler onboarding'
                  )}
                </button>
              </div>

              {onboardingTests && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  onboardingTests.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-4">
                    {onboardingTests.success ? (
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`font-medium ${
                      onboardingTests.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {onboardingTests.message}
                    </span>
                    {onboardingTests.totalTime && (
                      <span className="ml-2 text-xs text-gray-600">
                        ({onboardingTests.totalTime}ms)
                      </span>
                    )}
                  </div>
                  
                  {onboardingTests.steps && (
                    <div className="space-y-2">
                      {onboardingTests.steps.map((step: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>
                            Étape {step.step}: {step.name}
                          </span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {step.duration}ms
                            </span>
                            {step.success ? (
                              <span className="text-green-600">✅</span>
                            ) : (
                              <span className="text-red-600">❌</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {onboardingTests.summary && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Étapes réussies:</span>
                          <span className="ml-2 font-medium">
                            {onboardingTests.summary.successfulSteps}/{onboardingTests.summary.totalSteps}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Temps moyen:</span>
                          <span className="ml-2 font-medium">
                            {Math.round(onboardingTests.summary.avgStepTime)}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informations système */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Utilisateur:</span>
                  <span className="ml-2 font-medium">{session.user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Environnement:</span>
                  <span className="ml-2 font-medium">{process.env.NODE_ENV || 'development'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="ml-2 font-medium">{new Date().toISOString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}