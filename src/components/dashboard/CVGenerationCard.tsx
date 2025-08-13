'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SubscriptionService } from '@/lib/subscription/plans';
import UpgradeModal from '@/components/pricing/UpgradeModal';

interface CVGenerationInfo {
  hasAccess: boolean;
  currentPlan: string;
  portfolios: Array<{
    id: string;
    title: string;
    lastGeneration: string | null;
  }>;
}

export default function CVGenerationCard() {
  const { data: session } = useSession();
  const [cvInfo, setCvInfo] = useState<CVGenerationInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchCVInfo();
    }
  }, [session]);

  const fetchCVInfo = async () => {
    try {
      const response = await fetch('/api/cv/generate');
      const data = await response.json();
      setCvInfo(data);
    } catch (error) {
      console.error('Erreur lors du chargement des informations CV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCV = async (portfolioId: string) => {
    if (!cvInfo?.hasAccess) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(portfolioId);

    try {
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.upgradeRequired) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(error.error || 'Erreur lors de la génération');
      }

      // Télécharger le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Rafraîchir les informations
      fetchCVInfo();
    } catch (error) {
      console.error('Erreur génération CV:', error);
      alert('Erreur lors de la génération du CV. Veuillez réessayer.');
    } finally {
      setIsGenerating(null);
    }
  };

  const formatLastGeneration = (date: string | null) => {
    if (!date) return 'Jamais généré';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Génération CV AI
          </h3>
          {!cvInfo?.hasAccess && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Premium
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Convertissez automatiquement votre portfolio en CV professionnel au format PDF.
          Notre IA analyse vos projets pour extraire compétences et expériences.
        </p>

        {!cvInfo?.hasAccess ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h4 className="font-medium text-gray-900 mb-2">
              Fonctionnalité Premium
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Passez au plan Pro pour générer des CV professionnels à partir de vos portfolios
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Passer au plan Pro
            </button>
          </div>
        ) : cvInfo.portfolios.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucun portfolio disponible pour la génération de CV</p>
            <p className="text-sm mt-1">Créez d'abord un portfolio avec des projets</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvInfo.portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {portfolio.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Dernier CV: {formatLastGeneration(portfolio.lastGeneration)}
                  </p>
                </div>

                <button
                  onClick={() => handleGenerateCV(portfolio.id)}
                  disabled={isGenerating === portfolio.id}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating === portfolio.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération...
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Générer CV
                    </>
                  )}
                </button>
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h5 className="text-sm font-medium text-blue-900">
                    Comment ça marche ?
                  </h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Notre IA analyse automatiquement vos projets pour extraire vos compétences,
                    expériences et réalisations, puis génère un CV professionnel optimisé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={cvInfo?.currentPlan || 'free'}
        feature="Génération CV AI"
      />
    </>
  );
}