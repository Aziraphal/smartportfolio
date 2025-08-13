'use client';

import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  tags: string[];
  category: string;
}

interface PortfolioData {
  title: string;
  description: string;
  projects: Project[];
}

export default function PortfolioGenerator() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    title: '',
    description: '',
    projects: []
  });
  
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    tags: [],
    category: ''
  });

  const addProject = () => {
    if (newProject.title && newProject.description) {
      setPortfolioData(prev => ({
        ...prev,
        projects: [...prev.projects, {
          ...newProject,
          id: Date.now().toString(),
          tags: newProject.tags
        }]
      }));
      
      setNewProject({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        tags: [],
        category: ''
      });
    }
  };

  const removeProject = (id: string) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !newProject.tags.includes(tag)) {
      setNewProject(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewProject(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Informations Portfolio */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Informations du Portfolio</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du Portfolio
            </label>
            <input
              type="text"
              value={portfolioData.title}
              onChange={(e) => setPortfolioData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Portfolio de Design Graphique"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={portfolioData.description}
              onChange={(e) => setPortfolioData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre profil et vos compétences..."
            />
          </div>
        </div>
      </div>

      {/* Ajouter un Projet */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Ajouter un Projet</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du Projet
              </label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Site Web E-commerce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="web-design">Design Web</option>
                <option value="graphic-design">Design Graphique</option>
                <option value="ui-ux">UI/UX</option>
                <option value="development">Développement</option>
                <option value="branding">Branding</option>
                <option value="photography">Photographie</option>
                <option value="illustration">Illustration</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description du Projet
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez le projet, les défis relevés, les technologies utilisées..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'Image
              </label>
              <input
                type="url"
                value={newProject.imageUrl}
                onChange={(e) => setNewProject(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du Projet
              </label>
              <input
                type="url"
                value={newProject.projectUrl}
                onChange={(e) => setNewProject(prev => ({ ...prev, projectUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newProject.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un tag (appuyez sur Entrée)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>

          <button
            onClick={addProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Ajouter le Projet
          </button>
        </div>
      </div>

      {/* Projets Ajoutés */}
      {portfolioData.projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Projets ({portfolioData.projects.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioData.projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                {project.imageUrl && (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <h4 className="font-semibold text-lg">{project.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{project.category}</p>
                <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  {project.projectUrl && (
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Voir le projet
                    </a>
                  )}
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aperçu du Portfolio */}
      {(portfolioData.title || portfolioData.projects.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Aperçu du Portfolio</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-center mb-4">
              {portfolioData.title || 'Mon Portfolio'}
            </h1>
            {portfolioData.description && (
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                {portfolioData.description}
              </p>
            )}
            
            {portfolioData.projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioData.projects.slice(0, 6).map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {project.imageUrl && (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <p className="text-gray-600 text-sm">{project.description.slice(0, 100)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium">
              Générer le Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}