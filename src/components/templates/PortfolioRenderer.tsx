'use client';

import MinimalGridTemplate from './MinimalGridTemplate';
import CreativeShowcaseTemplate from './CreativeShowcaseTemplate';
import ProfessionalCVTemplate from './ProfessionalCVTemplate';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  sourceUrl?: string;
  tags: string[];
  category: string;
  featured: boolean;
}

export interface PortfolioData {
  id: string;
  title: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  theme: string;
  isPublic: boolean;
  user: {
    name?: string;
    email: string;
    image?: string;
  };
  projects: PortfolioProject[];
}

interface PortfolioRendererProps {
  portfolio: PortfolioData;
  preview?: boolean;
  editable?: boolean;
}

export default function PortfolioRenderer({ portfolio, preview = false, editable = false }: PortfolioRendererProps) {
  const renderTemplate = () => {
    const commonProps = {
      portfolio,
      preview,
      editable,
    };

    switch (portfolio.theme) {
      case 'minimal-grid':
        return <MinimalGridTemplate {...commonProps} />;
      case 'creative-showcase':
        return <CreativeShowcaseTemplate {...commonProps} />;
      case 'professional-cv':
        return <ProfessionalCVTemplate {...commonProps} />;
      default:
        return <MinimalGridTemplate {...commonProps} />;
    }
  };

  return (
    <div className={`portfolio-renderer ${preview ? 'preview-mode' : ''}`}>
      {renderTemplate()}
      
      {/* SmartPortfolio Branding (Free Plan) */}
      {!preview && (
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href="https://smartportfolio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs text-gray-600 hover:text-gray-900 transition-colors border"
          >
            Créé avec <span className="font-semibold text-blue-600">SmartPortfolio</span>
          </a>
        </div>
      )}
    </div>
  );
}