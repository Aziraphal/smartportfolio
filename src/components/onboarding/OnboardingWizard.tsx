'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TemplateSelection from './TemplateSelection';
import IntegrationSetup from './IntegrationSetup';
import PersonalizationStep from './PersonalizationStep';

export type OnboardingStep = 'template' | 'integrations' | 'personalization' | 'complete';

export interface OnboardingData {
  template: string;
  integrations: Array<{
    platform: 'github' | 'behance' | 'dribbble';
    username: string;
    connected: boolean;
  }>;
  portfolioInfo: {
    title: string;
    description: string;
    subdomain: string;
    customDomain?: string;
  };
}

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingData) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('template');
  const [isLoading, setIsLoading] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    template: '',
    integrations: [],
    portfolioInfo: {
      title: `Portfolio de ${session?.user?.name || 'Mon nom'}`,
      description: '',
      subdomain: '',
    },
  });

  const steps = [
    { id: 'template', title: 'Choisir un template', description: 'Sélectionnez le style de votre portfolio' },
    { id: 'integrations', title: 'Connecter vos comptes', description: 'Importez vos projets automatiquement' },
    { id: 'personalization', title: 'Personnaliser', description: 'Ajoutez vos informations personnelles' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates,
      integrations: updates.integrations || prev.integrations,
      portfolioInfo: updates.portfolioInfo ? { ...prev.portfolioInfo, ...updates.portfolioInfo } : prev.portfolioInfo,
    }));
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'template':
        setCurrentStep('integrations');
        break;
      case 'integrations':
        setCurrentStep('personalization');
        break;
      case 'personalization':
        handleComplete();
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'integrations':
        setCurrentStep('template');
        break;
      case 'personalization':
        setCurrentStep('integrations');
        break;
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Créer le portfolio
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...onboardingData.portfolioInfo,
          theme: onboardingData.template,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du portfolio');
      }

      const portfolio = await response.json();

      // Configurer les intégrations
      for (const integration of onboardingData.integrations) {
        if (integration.connected) {
          await fetch('/api/integrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              portfolioId: portfolio.id,
              platform: integration.platform,
              username: integration.username,
            }),
          });
        }
      }

      // Déclencher la synchronisation initiale
      await fetch('/api/sync/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: portfolio.id }),
      });

      if (onComplete) {
        onComplete(onboardingData);
      }

      router.push(`/dashboard?welcome=true&portfolioId=${portfolio.id}`);
    } catch (error) {
      console.error('Erreur onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'template':
        return !!onboardingData.template;
      case 'integrations':
        return true; // Optionnel
      case 'personalization':
        return !!onboardingData.portfolioInfo.title && !!onboardingData.portfolioInfo.subdomain;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Créons votre portfolio en 3 étapes
          </h1>
          <p className="mt-2 text-gray-600">
            Nous allons vous guider pour créer un portfolio professionnel en quelques minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-12 h-0.5 ml-6 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {currentStep === 'template' && (
            <TemplateSelection
              selectedTemplate={onboardingData.template}
              onTemplateSelect={(template) => updateOnboardingData({ template })}
            />
          )}
          
          {currentStep === 'integrations' && (
            <IntegrationSetup
              integrations={onboardingData.integrations}
              onIntegrationsUpdate={(integrations) => updateOnboardingData({ integrations })}
            />
          )}
          
          {currentStep === 'personalization' && (
            <PersonalizationStep
              portfolioInfo={onboardingData.portfolioInfo}
              onPortfolioInfoUpdate={(portfolioInfo) => updateOnboardingData({ portfolioInfo })}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 'template'}
            className={`px-6 py-2 rounded-md font-medium ${
              currentStep === 'template'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Précédent
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className={`px-6 py-2 rounded-md font-medium ${
              canProceed() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </div>
            ) : currentStep === 'personalization' ? (
              'Créer mon portfolio'
            ) : (
              'Suivant'
            )}
          </button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Passer l'assistant et créer manuellement
          </button>
        </div>
      </div>
    </div>
  );
}