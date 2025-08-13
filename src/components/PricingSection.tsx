'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/subscription/plans';

interface PricingButtonProps {
  plan: any;
  billingCycle: 'monthly' | 'yearly';
  className: string;
}

function PricingButton({ plan, billingCycle, className }: PricingButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (plan.price === 0) {
      window.location.href = session ? '/dashboard' : '/auth/signup';
      return;
    }

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
          planId: `${plan.id}-${billingCycle}`,
          successUrl: window.location.origin + '/dashboard?upgraded=true',
          cancelUrl: window.location.href
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Redirection...
        </div>
      ) : plan.price === 0 ? (
        'Commencer gratuitement'
      ) : (
        'Choisir ce plan'
      )}
    </button>
  );
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Tarifs</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choisissez le plan qui vous convient
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Commencez gratuitement, évoluez selon vos besoins
          </p>
        </div>

        {/* Toggle Annual/Monthly */}
        <div className="mt-16 flex justify-center">
          <div className="relative flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                !isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan, planIdx) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                plan.popular
                  ? 'bg-gray-900 ring-gray-900 relative'
                  : 'bg-white ring-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                  <div className="rounded-full bg-blue-600 px-4 py-1 text-center text-sm font-medium text-white">
                    Populaire
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3 className={`text-lg font-semibold leading-8 ${
                  plan.popular ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
              </div>
              
              <p className={`mt-4 text-sm leading-6 ${
                plan.popular ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {plan.description}
              </p>
              
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${
                  plan.popular ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.price === 0 
                    ? 'Gratuit' 
                    : SubscriptionService.formatPrice(
                        isAnnual 
                          ? SubscriptionService.calculatePrice(plan.id, 'year') / 12
                          : plan.price,
                        'EUR'
                      ).replace('/mois', '')
                  }
                </span>
                {plan.price > 0 && (
                  <span className={`text-sm font-semibold leading-6 ${
                    plan.popular ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    /mois
                  </span>
                )}
              </p>

              {/* Annual Savings */}
              {isAnnual && plan.price > 0 && (
                <p className={`text-sm mt-2 ${
                  plan.popular ? 'text-green-400' : 'text-green-600'
                }`}>
                  Économisez {SubscriptionService.formatPrice(
                    SubscriptionService.getAnnualSavings(plan.id),
                    'EUR'
                  ).replace('/mois', '')} par an
                </p>
              )}
              
              <PricingButton
                plan={plan}
                billingCycle={isAnnual ? 'yearly' : 'monthly'}
                className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.popular
                    ? 'bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white'
                    : 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              />
              
              <ul className={`mt-8 space-y-3 text-sm leading-6 ${
                plan.popular ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg
                      className={`h-6 w-5 flex-none ${
                        plan.popular ? 'text-white' : 'text-blue-600'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-2xl">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Questions fréquentes
          </h3>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-gray-600">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Y a-t-il une période d'essai ?
              </h4>
              <p className="text-gray-600">
                Le plan Pro et Équipe offrent 14 jours d'essai gratuit. 
                Aucune carte de crédit requise pour commencer.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Que se passe-t-il si j'annule mon abonnement ?
              </h4>
              <p className="text-gray-600">
                Votre portfolio reste accessible jusqu'à la fin de votre période payée, 
                puis passe automatiquement au plan gratuit.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Les intégrations sont-elles sécurisées ?
              </h4>
              <p className="text-gray-600">
                Nous utilisons OAuth2 pour toutes les connexions et ne stockons jamais 
                vos mots de passe. Vos données sont chiffrées et sécurisées.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-lg text-gray-600">
            Besoin d'aide pour choisir ? 
            <a href="mailto:support@smartportfolio.com" className="ml-1 text-blue-600 hover:underline">
              Contactez notre équipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}