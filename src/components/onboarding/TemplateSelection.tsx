'use client';

import { useState } from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'minimal' | 'creative' | 'professional';
  features: string[];
  popular?: boolean;
}

const templates: Template[] = [
  {
    id: 'minimal-grid',
    name: 'Grid Minimal',
    description: 'Design épuré avec mise en page en grille',
    preview: '/templates/minimal-grid.jpg',
    category: 'minimal',
    features: ['Grille responsive', 'Typography moderne', 'Animations subtiles'],
    popular: true,
  },
  {
    id: 'creative-showcase',
    name: 'Creative Showcase',
    description: 'Parfait pour les designers et artistes',
    preview: '/templates/creative-showcase.jpg',
    category: 'creative',
    features: ['Animations créatives', 'Galerie plein écran', 'Couleurs vibrantes'],
  },
  {
    id: 'professional-cv',
    name: 'Professional CV',
    description: 'Style corporate et professionnel',
    preview: '/templates/professional-cv.jpg',
    category: 'professional',
    features: ['Layout corporatif', 'Section expérience', 'Contact intégré'],
  },
];

interface TemplateSelectionProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function TemplateSelection({ selectedTemplate, onTemplateSelect }: TemplateSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Tous', count: templates.length },
    { id: 'minimal', name: 'Minimal', count: templates.filter(t => t.category === 'minimal').length },
    { id: 'creative', name: 'Créatif', count: templates.filter(t => t.category === 'creative').length },
    { id: 'professional', name: 'Professionnel', count: templates.filter(t => t.category === 'professional').length },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre template
        </h2>
        <p className="text-gray-600">
          Sélectionnez un style qui correspond à votre personnalité professionnelle
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {template.popular && (
              <div className="absolute -top-2 -right-2 z-10">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Populaire
                </span>
              </div>
            )}

            {/* Template Preview */}
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    {template.category === 'minimal' && (
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                    {template.category === 'creative' && (
                      <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v14a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a4 4 0 004-4V5z" />
                      </svg>
                    )}
                    {template.category === 'professional' && (
                      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V4" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Aperçu du template</div>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              {/* Features */}
              <div className="space-y-1">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-4 left-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Button */}
      {selectedTemplate && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Prévisualiser le template sélectionné →
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Pas de souci si vous changez d'avis !
            </p>
            <p className="text-sm text-blue-700">
              Vous pourrez modifier le template de votre portfolio à tout moment depuis votre dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}