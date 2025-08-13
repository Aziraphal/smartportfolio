'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PortfolioData } from './PortfolioRenderer';

interface MinimalGridTemplateProps {
  portfolio: PortfolioData;
  preview?: boolean;
  editable?: boolean;
}

export default function MinimalGridTemplate({ portfolio, preview = false }: MinimalGridTemplateProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const featuredProjects = portfolio.projects.filter(p => p.featured).slice(0, 6);
  const regularProjects = portfolio.projects.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {portfolio.user.image && (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden">
              <Image
                src={portfolio.user.image}
                alt={portfolio.user.name || 'Profile'}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            {portfolio.title}
          </h1>
          
          {portfolio.description && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {portfolio.description}
            </p>
          )}
        </div>
      </header>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-12 text-center">
              Projets sélectionnés
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      {regularProjects.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-12 text-center">
              Tous les projets
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <footer className="py-16 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-gray-900 mb-6">
            Travaillons ensemble
          </h2>
          <p className="text-gray-600 mb-8">
            Intéressé par mon travail ? N'hésitez pas à me contacter pour discuter de vos projets.
          </p>
          <a
            href={`mailto:${portfolio.user.email}`}
            className="inline-flex items-center px-8 py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 font-medium"
          >
            Me contacter
          </a>
        </div>
      </footer>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={portfolio.projects.find(p => p.id === selectedProject)!}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function ProjectCard({ 
  project, 
  onSelect, 
  compact = false 
}: { 
  project: any; 
  onSelect: (id: string) => void; 
  compact?: boolean;
}) {
  return (
    <div
      onClick={() => onSelect(project.id)}
      className="group cursor-pointer"
    >
      <div className={`bg-gray-100 ${compact ? 'aspect-square' : 'aspect-video'} overflow-hidden mb-4 transition-transform duration-200 group-hover:scale-105`}>
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={400}
            height={compact ? 400 : 300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
          {project.title}
        </h3>
        <p className={`text-gray-600 text-sm ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {project.description}
        </p>
        
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-medium">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {project.imageUrl && (
            <div className="mb-6">
              <Image
                src={project.imageUrl}
                alt={project.title}
                width={800}
                height={600}
                className="w-full rounded-lg"
              />
            </div>
          )}
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">{project.description}</p>
            
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag, index) => (
                  <span key={index} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex gap-4">
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded"
                >
                  Voir le projet
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              
              {project.sourceUrl && project.sourceUrl !== project.projectUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  Code source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}