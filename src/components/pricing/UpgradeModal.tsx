'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/subscription/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  feature?: string;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', feature }: UpgradeModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const upgradeReasons = feature 
    ? [`Débloquer : ${feature}`]
    : SubscriptionService.getUpgradeReasons(currentPlan, selectedPlan);

  const handleUpgrade = async (planId: string) => {
    if (!session) {
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: `${planId}-${billingCycle}`,
          successUrl: window.location.origin + '/dashboard?upgraded=true',
          cancelUrl: window.location.href
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Erreur lors de la mise à niveau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Passer au niveau supérieur
              </h2>
              <p className="text-gray-600 mt-1">
                Débloquez tout le potentiel de SmartPortfolio
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-center">
              <div className="flex bg-white rounded-lg p-1 border">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Annuel
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Feature highlight */}
            {feature && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Fonctionnalité Premium requise
                    </h3>
                    <p className="text-sm text-blue-700">
                      "{feature}" n'est disponible que sur les plans payants
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free').map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const price = billingCycle === 'yearly' 
                  ? SubscriptionService.calculatePrice(plan.id, 'yearly') / 12
                  : plan.price;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as 'pro' | 'team')}
                    className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="mb-3">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Plus populaire
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {SubscriptionService.formatPrice(price, 'EUR').replace('/mois', '')}
                      </span>
                      <span className="text-gray-600 ml-1">/mois</span>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium">
                          Économisez {SubscriptionService.formatPrice(
                            SubscriptionService.getAnnualSavings(plan.id),
                            'EUR'
                          ).replace('/mois', '')} par an
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Redirection...
                        </div>
                      ) : (
                        `Passer au plan ${plan.name}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Why upgrade */}
            {upgradeReasons.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">
                  Pourquoi passer Premium ?
                </h3>
                <ul className="space-y-2">
                  {upgradeReasons.map((reason, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guarantee */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h4 className="font-medium text-green-900">Garantie satisfait ou remboursé</h4>
                  <p className="text-sm text-green-700">
                    30 jours pour changer d'avis, remboursement intégral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}