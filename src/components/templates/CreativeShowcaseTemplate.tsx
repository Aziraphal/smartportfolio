'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PortfolioData } from './PortfolioRenderer';

interface CreativeShowcaseTemplateProps {
  portfolio: PortfolioData;
  preview?: boolean;
  editable?: boolean;
}

export default function CreativeShowcaseTemplate({ portfolio, preview = false }: CreativeShowcaseTemplateProps) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const featuredProjects = portfolio.projects.filter(p => p.featured);
  const allProjects = portfolio.projects;

  // Auto-play slideshow
  useEffect(() => {
    if (isAutoPlaying && featuredProjects.length > 1) {
      const interval = setInterval(() => {
        setCurrentProjectIndex((prev) => (prev + 1) % featuredProjects.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, featuredProjects.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          {portfolio.user.image && (
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm">
              <Image
                src={portfolio.user.image}
                alt={portfolio.user.name || 'Profile'}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {portfolio.title}
          </h1>

          {portfolio.description && (
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {portfolio.description}
            </p>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full font-semibold text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Découvrir mes créations
            </button>
            <a
              href={`mailto:${portfolio.user.email}`}
              className="px-8 py-4 border border-white/30 backdrop-blur-sm rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200"
            >
              Me contacter
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Slideshow */}
      {featuredProjects.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Projets phares
            </h2>

            <div className="relative">
              {/* Main Slide */}
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl">
                {featuredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentProjectIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-24 h-24 mx-auto mb-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-white/80">{project.title}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Project Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                      <div className="p-8 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{project.title}</h3>
                        <p className="text-lg text-gray-300 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Voir le projet
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                {/* Previous/Next Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentProjectIndex((prev) => 
                      prev === 0 ? featuredProjects.length - 1 : prev - 1
                    )}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentProjectIndex((prev) => 
                      (prev + 1) % featuredProjects.length
                    )}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {featuredProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentProjectIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentProjectIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Auto-play Toggle */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                    isAutoPlaying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isAutoPlaying ? "M10 9v6l5-3-5-3z" : "M6 4h4v16H6zM14 4h4v16h-4z"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Projects Grid */}
      <section id="projects" className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Toutes mes créations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="aspect-video overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 group-hover:text-pink-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors font-medium"
          >
            Voir le projet
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}