export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">SmartPortfolio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Connexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Votre portfolio qui se met à jour{" "}
            <span className="text-blue-600">automatiquement</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Connectez vos comptes Behance, GitHub et Dribbble. Notre IA optimise vos descriptions pour le SEO. 
            Votre portfolio reste toujours à jour, sans effort.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-semibold shadow-sm">
              Commencer gratuitement
            </button>
            <button className="text-gray-900 font-semibold">
              Voir un exemple <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Mise à jour automatique</h3>
              <p className="mt-2 text-gray-600">
                Vos nouveaux projets apparaissent automatiquement sur votre portfolio
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">IA SEO optimisée</h3>
              <p className="mt-2 text-gray-600">
                Descriptions automatiquement optimisées pour les moteurs de recherche
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Multi-plateformes</h3>
              <p className="mt-2 text-gray-600">
                Behance, GitHub, Dribbble - Tout centralisé en un seul endroit
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Prêt à automatiser votre portfolio ?
          </h2>
          <p className="mt-4 text-blue-100">
            Rejoignez des centaines de créatifs qui font confiance à SmartPortfolio
          </p>
          <a href="/create" className="mt-8 inline-block bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-md font-semibold">
            Créer mon portfolio gratuitement
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SmartPortfolio. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
