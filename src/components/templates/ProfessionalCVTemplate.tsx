'use client';

import Image from 'next/image';
import { PortfolioData } from './PortfolioRenderer';

interface ProfessionalCVTemplateProps {
  portfolio: PortfolioData;
  preview?: boolean;
  editable?: boolean;
}

export default function ProfessionalCVTemplate({ portfolio, preview = false }: ProfessionalCVTemplateProps) {
  const developmentProjects = portfolio.projects.filter(p => 
    p.category.includes('development') || p.tags.some(tag => 
      ['JavaScript', 'React', 'Node.js', 'Python', 'GitHub'].includes(tag)
    )
  );
  
  const designProjects = portfolio.projects.filter(p => 
    p.category.includes('design') || p.tags.some(tag => 
      ['Design', 'UI/UX', 'Behance', 'Dribbble'].includes(tag)
    )
  );

  const allSkills = Array.from(new Set(
    portfolio.projects.flatMap(p => p.tags)
  )).slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {portfolio.user.image && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src={portfolio.user.image}
                  alt={portfolio.user.name || 'Profile'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {portfolio.user.name || portfolio.title}
              </h1>
              <div className="text-lg text-blue-600 font-medium mb-4">
                Développeur Full-Stack & Designer
              </div>
              {portfolio.description && (
                <p className="text-gray-600 max-w-2xl leading-relaxed">
                  {portfolio.description}
                </p>
              )}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href={`mailto:${portfolio.user.email}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Me contacter
                </a>
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger CV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience / Projects */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V4" />
                </svg>
                Projets récents
              </h2>

              <div className="space-y-6">
                {portfolio.projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="border-l-4 border-blue-600 pl-6 pb-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                    
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <div className="text-sm text-gray-500">
                        {project.category} • {new Date().getFullYear()}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                      >
                        Voir le projet
                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Project Categories */}
            {developmentProjects.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Développement
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {developmentProjects.slice(0, 4).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {designProjects.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v14a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a4 4 0 004-4V5z" />
                  </svg>
                  Design & Créativité
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {designProjects.slice(0, 4).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{portfolio.user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                  <span className="text-sm">{portfolio.subdomain}.smartportfolio.com</span>
                </div>
              </div>
            </section>

            {/* Skills */}
            {allSkills.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Compétences</h2>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Statistics */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projets terminés</span>
                  <span className="font-bold text-lg text-blue-600">{portfolio.projects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Technologies maîtrisées</span>
                  <span className="font-bold text-lg text-green-600">{allSkills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Années d'expérience</span>
                  <span className="font-bold text-lg text-purple-600">3+</span>
                </div>
              </div>
            </section>

            {/* Availability */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <h2 className="text-lg font-bold text-gray-900">Disponibilité</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Actuellement disponible pour de nouveaux projets
              </p>
              <a
                href={`mailto:${portfolio.user.email}`}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block font-medium"
              >
                Discutons de votre projet
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {project.imageUrl && (
        <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={300}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {project.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      {project.projectUrl && (
        <a
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
        >
          Voir
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}