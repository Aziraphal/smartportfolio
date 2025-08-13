import PortfolioGenerator from '@/components/PortfolioGenerator';

export default function CreatePortfolio() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-gray-900">SmartPortfolio</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer votre Portfolio
          </h1>
          <p className="mt-2 text-gray-600">
            Ajoutez vos projets manuellement ou connectez vos comptes
          </p>
        </div>
        
        <PortfolioGenerator />
      </div>
    </div>
  );
}