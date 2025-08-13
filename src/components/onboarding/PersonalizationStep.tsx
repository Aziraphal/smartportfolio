'use client';

import { useState } from 'react';

interface PortfolioInfo {
  title: string;
  description: string;
  subdomain: string;
  customDomain?: string;
}

interface PersonalizationStepProps {
  portfolioInfo: PortfolioInfo;
  onPortfolioInfoUpdate: (info: Partial<PortfolioInfo>) => void;
}

export default function PersonalizationStep({ portfolioInfo, onPortfolioInfoUpdate }: PersonalizationStepProps) {
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain.trim() || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setIsCheckingSubdomain(true);
    
    try {
      const response = await fetch('/api/portfolios/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });
      
      const result = await response.json();
      setSubdomainAvailable(result.available);
    } catch (error) {
      console.error('Subdomain check error:', error);
      setSubdomainAvailable(null);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (subdomain: string) => {
    // Clean subdomain: lowercase, alphanumeric + hyphens only
    const cleanSubdomain = subdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    onPortfolioInfoUpdate({ subdomain: cleanSubdomain });
    
    // Reset availability check
    setSubdomainAvailable(null);
    
    // Check availability after a delay
    if (cleanSubdomain.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkSubdomainAvailability(cleanSubdomain);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const generateSuggestions = () => {
    const name = portfolioInfo.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      `${name}-portfolio`,
      `${name}-design`,
      `${name}-creative`,
      `portfolio-${name}`,
    ].filter(Boolean);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personnalisez votre portfolio
        </h2>
        <p className="text-gray-600">
          Ajoutez vos informations pour créer une présence professionnelle
        </p>
      </div>

      <div className="space-y-6">
        {/* Portfolio Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de votre portfolio *
          </label>
          <input
            type="text"
            value={portfolioInfo.title}
            onChange={(e) => onPortfolioInfoUpdate({ title: e.target.value })}
            placeholder="Ex: Portfolio de Marie Dupont"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce titre apparaîtra en haut de votre portfolio ({portfolioInfo.title.length}/60)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description professionnelle
          </label>
          <textarea
            value={portfolioInfo.description}
            onChange={(e) => onPortfolioInfoUpdate({ description: e.target.value })}
            placeholder="Ex: Designer UX/UI passionnée par la création d'expériences digitales innovantes. Spécialisée dans le design mobile et les interfaces utilisateur intuitives."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">
            Une brève description de votre profil et expertise ({portfolioInfo.description.length}/300)
          </p>
        </div>

        {/* Subdomain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de votre portfolio *
          </label>
          <div className="flex items-center">
            <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-500 text-sm">
              https://
            </span>
            <input
              type="text"
              value={portfolioInfo.subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="votre-nom"
              className="flex-1 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={30}
            />
            <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-gray-500 text-sm">
              .smartportfolio.com
            </span>
          </div>
          
          {/* Subdomain Status */}
          <div className="mt-2">
            {isCheckingSubdomain && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Vérification de la disponibilité...
              </div>
            )}
            
            {!isCheckingSubdomain && subdomainAvailable === true && portfolioInfo.subdomain && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ✅ {portfolioInfo.subdomain}.smartportfolio.com est disponible
              </div>
            )}
            
            {!isCheckingSubdomain && subdomainAvailable === false && portfolioInfo.subdomain && (
              <div className="text-sm text-red-600">
                ❌ Ce nom n'est pas disponible
              </div>
            )}
          </div>

          {/* Subdomain Suggestions */}
          {portfolioInfo.subdomain && subdomainAvailable === false && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Suggestions disponibles :</p>
              <div className="flex flex-wrap gap-2">
                {generateSuggestions().map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onPortfolioInfoUpdate({ subdomain: suggestion })}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Votre portfolio sera accessible à cette adresse. Seules les lettres, chiffres et tirets sont autorisés.
          </p>
        </div>

        {/* Custom Domain (Optional) */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Domaine personnalisé</h3>
              <p className="text-sm text-gray-600">
                Utilisez votre propre nom de domaine (plan Pro requis)
              </p>
            </div>
            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
              PRO
            </div>
          </div>
          
          <input
            type="text"
            value={portfolioInfo.customDomain || ''}
            onChange={(e) => onPortfolioInfoUpdate({ customDomain: e.target.value })}
            placeholder="Ex: monportfolio.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            Cette fonctionnalité sera disponible après votre inscription au plan Pro
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Aperçu de votre portfolio</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-20">Titre:</span>
            <span className="font-medium">{portfolioInfo.title || 'Mon Portfolio'}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-20">URL:</span>
            <span className="font-medium text-blue-600">
              {portfolioInfo.subdomain ? `${portfolioInfo.subdomain}.smartportfolio.com` : 'votre-nom.smartportfolio.com'}
            </span>
          </div>
          {portfolioInfo.description && (
            <div className="flex text-sm">
              <span className="text-gray-600 w-20">Bio:</span>
              <span className="text-gray-700">{portfolioInfo.description.substring(0, 100)}
                {portfolioInfo.description.length > 100 && '...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Requis pour continuer
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                {portfolioInfo.title ? (
                  <span className="text-green-600 mr-2">✅</span>
                ) : (
                  <span className="text-gray-400 mr-2">⭕</span>
                )}
                Titre du portfolio
              </li>
              <li className="flex items-center">
                {portfolioInfo.subdomain && subdomainAvailable === true ? (
                  <span className="text-green-600 mr-2">✅</span>
                ) : (
                  <span className="text-gray-400 mr-2">⭕</span>
                )}
                URL disponible
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}