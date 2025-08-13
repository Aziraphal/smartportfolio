'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubscriptionService } from '@/lib/subscription/plans';
import UpgradeModal from '@/components/pricing/UpgradeModal';

interface SubscriptionCardProps {
  subscription: any;
  currentPlan: string;
}

export default function SubscriptionCard({ subscription, currentPlan }: SubscriptionCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const plan = SubscriptionService.getPlan(currentPlan);
  const isActive = subscription?.status === 'active';
  const isTrial = subscription?.status === 'trialing';

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleManageSubscription = async () => {
    if (!isActive) return;
    
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur ouverture portail:', error);
      alert('Erreur lors de l\'ouverture du portail de gestion');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const getStatusColor = () => {
    if (isTrial) return 'bg-blue-100 text-blue-800';
    if (isActive) return 'bg-green-100 text-green-800';
    if (currentPlan === 'free') return 'bg-gray-100 text-gray-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = () => {
    if (isTrial) return 'Essai gratuit';
    if (isActive) return 'Actif';
    if (currentPlan === 'free') return 'Plan gratuit';
    return 'Expiré';
  };

  const daysUntilExpiration = () => {
    if (!subscription?.stripeCurrentPeriodEnd) return null;
    const endDate = new Date(subscription.stripeCurrentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = daysUntilExpiration();

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Abonnement
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {plan && (
          <div className="space-y-4">
            {/* Plan actuel */}
            <div>
              <h4 className="font-medium text-gray-900 text-lg">
                Plan {plan.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {plan.description}
              </p>
              {plan.price > 0 && (
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {SubscriptionService.formatPrice(plan.price, 'EUR', 'month')}
                </p>
              )}
            </div>

            {/* Informations de facturation */}
            {isActive && subscription && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prochaine facturation:</span>
                    <span className="font-medium">
                      {formatDate(subscription.stripeCurrentPeriodEnd)}
                    </span>
                  </div>
                  {daysLeft !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expire dans:</span>
                      <span className={`font-medium ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Abonnement annulé, expire le {formatDate(subscription.stripeCurrentPeriodEnd)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Essai gratuit */}
            {isTrial && subscription?.trialEnd && (
              <div className="border-t border-gray-200 pt-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h5 className="text-sm font-medium text-blue-900">
                    🎉 Essai gratuit en cours
                  </h5>
                  <p className="text-xs text-blue-800 mt-1">
                    Votre essai se termine le {formatDate(subscription.trialEnd)}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {currentPlan === 'free' ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                  </svg>
                  Passer Premium
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleManageSubscription}
                    disabled={isLoadingPortal}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoadingPortal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Chargement...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Gérer l'abonnement
                      </>
                    )}
                  </button>
                  
                  {currentPlan !== 'team' && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                      </svg>
                      Upgrader
                    </button>
                  )}
                </div>
              )}

              <Link
                href="/pricing"
                className="block text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Comparer les plans →
              </Link>
            </div>
          </div>
        )}

        {/* Avantages du plan actuel */}
        {plan && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">
              Ce qui est inclus:
            </h5>
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-sm text-gray-500">
                  ... et {plan.features.length - 4} autres fonctionnalités
                </li>
              )}
            </ul>
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