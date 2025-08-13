import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-gray-900">SmartPortfolio</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-500 hover:text-gray-900">Accueil</a>
              <a href="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Commencer
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <PricingSection />
    </div>
  );
}