export interface SEOOptimizationRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetKeywords?: string[];
  language?: 'fr' | 'en';
  tone?: 'professional' | 'creative' | 'minimal';
}

export interface SEOOptimizedContent {
  title: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  confidence: number;
  suggestions: string[];
}

export interface SEOAnalysis {
  score: number;
  issues: string[];
  improvements: string[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
}

export class SEOOptimizer {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async optimizeContent(request: SEOOptimizationRequest): Promise<SEOOptimizedContent> {
    const language = request.language || 'fr';
    
    const prompt = this.buildPrompt(request, language);
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: language === 'fr' 
                ? 'Tu es un expert en SEO et en marketing digital. Tu optimises les contenus pour améliorer leur référencement naturel.'
                : 'You are an SEO and digital marketing expert. You optimize content to improve their organic search ranking.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Aucune réponse de l\'IA');
      }

      return this.parseAIResponse(content, request);

    } catch (error) {
      console.error('Erreur optimisation SEO:', error);
      
      // Fallback: optimisation basique sans IA
      return this.basicOptimization(request);
    }
  }

  private buildPrompt(request: SEOOptimizationRequest, language: 'fr' | 'en'): string {
    const tone = request.tone || 'professional';
    const toneInstructions = this.getToneInstructions(tone, language);
    
    const prompts = {
      fr: `
Optimise ce contenu de portfolio pour le SEO avec un ton ${this.getToneName(tone, 'fr')} :

**Titre actuel :** ${request.title}
**Description actuelle :** ${request.description}
**Catégorie :** ${request.category}
**Tags :** ${request.tags.join(', ')}
**Ton souhaité :** ${this.getToneName(tone, 'fr')}
${request.targetKeywords ? `**Mots-clés cibles :** ${request.targetKeywords.join(', ')}` : ''}

${toneInstructions}

Fournis une réponse au format JSON avec :
{
  "title": "titre optimisé (50-60 caractères)",
  "description": "description optimisée pour le portfolio (150-300 mots)",
  "metaDescription": "meta description SEO (150-160 caractères)", 
  "keywords": ["mot-clé1", "mot-clé2", "mot-clé3"],
  "slug": "url-slug-optimise",
  "confidence": 0.8,
  "suggestions": ["conseil 1", "conseil 2"]
}

Optimise pour :
- Mots-clés pertinents pour ${request.category}
- Ton ${this.getToneName(tone, 'fr')} cohérent
- Lisibilité et engagement
- Référencement local français
- Call-to-action naturel
`,
      en: `
Optimize this portfolio content for SEO with a ${tone} tone:

**Current Title:** ${request.title}
**Current Description:** ${request.description}
**Category:** ${request.category}
**Tags:** ${request.tags.join(', ')}
**Desired Tone:** ${tone}
${request.targetKeywords ? `**Target Keywords:** ${request.targetKeywords.join(', ')}` : ''}

${toneInstructions}

Provide a JSON response with:
{
  "title": "optimized title (50-60 characters)",
  "description": "optimized portfolio description (150-300 words)",
  "metaDescription": "SEO meta description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "slug": "optimized-url-slug",
  "confidence": 0.8,
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Optimize for:
- Relevant keywords for ${request.category}
- Consistent ${tone} tone
- Readability and engagement
- Search engine visibility
- Natural call-to-action
`
    };

    return prompts[language];
  }

  private getToneInstructions(tone: string, language: 'fr' | 'en'): string {
    const instructions = {
      fr: {
        professional: `
**Instructions pour le ton professionnel :**
- Utilisez un vocabulaire soutenu et précis
- Mettez l'accent sur l'expertise et les résultats
- Privilégiez les termes techniques appropriés
- Adoptez un style formel mais accessible
- Incluez des métriques et réalisations concrètes
        `,
        creative: `
**Instructions pour le ton créatif :**
- Utilisez un langage expressif et imagé
- Incorporez de la personnalité et de l'émotion
- Privilégiez les métaphores et descriptions visuelles
- Adoptez un style dynamique et inspirant
- Mettez l'accent sur l'innovation et l'originalité
        `,
        minimal: `
**Instructions pour le ton minimal :**
- Privilégiez la concision et la clarté
- Éliminez les mots superflus
- Utilisez des phrases courtes et impactantes
- Adoptez un style direct et efficace
- Concentrez-vous sur l'essentiel
        `
      },
      en: {
        professional: `
**Professional tone instructions:**
- Use sophisticated and precise vocabulary
- Emphasize expertise and results
- Include appropriate technical terms
- Adopt a formal but accessible style
- Include concrete metrics and achievements
        `,
        creative: `
**Creative tone instructions:**
- Use expressive and imaginative language
- Incorporate personality and emotion
- Favor metaphors and visual descriptions
- Adopt a dynamic and inspiring style
- Emphasize innovation and originality
        `,
        minimal: `
**Minimal tone instructions:**
- Prioritize conciseness and clarity
- Eliminate superfluous words
- Use short and impactful sentences
- Adopt a direct and efficient style
- Focus on the essential
        `
      }
    };

    return instructions[language][tone as keyof typeof instructions[typeof language]] || instructions[language].professional;
  }

  private getToneName(tone: string, language: 'fr' | 'en'): string {
    const names = {
      fr: {
        professional: 'professionnel',
        creative: 'créatif',
        minimal: 'minimaliste'
      },
      en: {
        professional: 'professional',
        creative: 'creative',
        minimal: 'minimal'
      }
    };

    return names[language][tone as keyof typeof names[typeof language]] || names[language].professional;
  }

  private parseAIResponse(content: string, request: SEOOptimizationRequest): SEOOptimizedContent {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format JSON non trouvé');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || request.title,
        description: parsed.description || request.description,
        metaDescription: parsed.metaDescription || this.generateMetaDescription(parsed.description || request.description),
        keywords: parsed.keywords || request.tags,
        slug: parsed.slug || this.generateSlug(parsed.title || request.title),
        confidence: parsed.confidence || 0.7,
        suggestions: parsed.suggestions || []
      };

    } catch (error) {
      console.error('Erreur parsing réponse IA:', error);
      return this.basicOptimization(request);
    }
  }

  private basicOptimization(request: SEOOptimizationRequest): SEOOptimizedContent {
    return {
      title: this.optimizeTitle(request.title),
      description: this.optimizeDescription(request.description, request.category),
      metaDescription: this.generateMetaDescription(request.description),
      keywords: this.generateKeywords(request),
      slug: this.generateSlug(request.title),
      confidence: 0.5,
      suggestions: [
        'Utilisez des mots-clés pertinents dans le titre',
        'Ajoutez plus de détails dans la description',
        'Incluez un call-to-action clair'
      ]
    };
  }

  private optimizeTitle(title: string): string {
    // Assurer que le titre fait 50-60 caractères
    if (title.length > 60) {
      return title.substring(0, 57) + '...';
    }
    
    // Ajouter des mots-clés si trop court
    if (title.length < 30) {
      return title + ' - Portfolio Professionnel';
    }
    
    return title;
  }

  private optimizeDescription(description: string, category: string): string {
    const words = description.split(' ');
    
    if (words.length < 50) {
      return description + ` Ce projet ${category} démontre mes compétences techniques et créatives. Découvrez mon approche innovante et les résultats obtenus.`;
    }
    
    if (words.length > 100) {
      return words.slice(0, 100).join(' ') + '...';
    }
    
    return description;
  }

  private generateMetaDescription(description: string): string {
    const words = description.split(' ');
    const metaDesc = words.slice(0, 25).join(' ');
    
    return metaDesc.length > 160 
      ? metaDesc.substring(0, 157) + '...'
      : metaDesc;
  }

  private generateKeywords(request: SEOOptimizationRequest): string[] {
    const keywords = new Set([
      ...request.tags.map(tag => tag.toLowerCase()),
      request.category.toLowerCase(),
      'portfolio',
      'design',
      'créatif'
    ]);

    return Array.from(keywords).slice(0, 8);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async analyzeContent(content: string, targetKeywords: string[] = []): Promise<SEOAnalysis> {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    // Calculer la densité des mots-clés
    const keywordDensity: Record<string, number> = {};
    
    targetKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const occurrences = words.filter(word => word.includes(keywordLower)).length;
      keywordDensity[keyword] = occurrences / totalWords;
    });

    // Score de lisibilité basique (Flesch approximation)
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = totalWords / sentences;
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence)));

    // Calcul du score SEO
    let score = 50; // Score de base

    // Bonifications
    if (totalWords >= 150 && totalWords <= 300) score += 20;
    if (readabilityScore > 60) score += 15;
    if (Object.values(keywordDensity).some(density => density > 0.01 && density < 0.05)) score += 15;

    const issues: string[] = [];
    const improvements: string[] = [];

    if (totalWords < 100) {
      issues.push('Description trop courte');
      improvements.push('Ajoutez plus de détails sur le projet');
    }

    if (totalWords > 400) {
      issues.push('Description trop longue');
      improvements.push('Condensez le contenu principal');
    }

    if (readabilityScore < 50) {
      issues.push('Lisibilité faible');
      improvements.push('Utilisez des phrases plus courtes');
    }

    if (Object.values(keywordDensity).every(density => density < 0.01)) {
      issues.push('Densité de mots-clés insuffisante');
      improvements.push('Incluez plus de mots-clés pertinents');
    }

    return {
      score: Math.round(score),
      issues,
      improvements,
      keywordDensity,
      readabilityScore: Math.round(readabilityScore)
    };
  }

  async batchOptimize(requests: SEOOptimizationRequest[]): Promise<SEOOptimizedContent[]> {
    const results: SEOOptimizedContent[] = [];
    
    // Traiter par lots de 5 pour éviter les limites d'API
    const batchSize = 5;
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      const batchPromises = batch.map(request => 
        this.optimizeContent(request).catch(error => {
          console.error(`Erreur optimisation ${request.title}:`, error);
          return this.basicOptimization(request);
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pause entre les lots
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  static getRecommendedKeywords(category: string, language: 'fr' | 'en' = 'fr'): string[] {
    const keywords = {
      fr: {
        'web-design': ['design web', 'ui/ux', 'interface utilisateur', 'site web', 'responsive'],
        'graphic-design': ['design graphique', 'identité visuelle', 'création graphique', 'print'],
        'branding': ['branding', 'identité de marque', 'logo', 'charte graphique'],
        'photography': ['photographie', 'photo', 'shooting', 'portrait', 'paysage'],
        'illustration': ['illustration', 'dessin', 'art numérique', 'création'],
        'development': ['développement', 'programmation', 'code', 'application', 'web']
      },
      en: {
        'web-design': ['web design', 'ui/ux', 'user interface', 'website', 'responsive'],
        'graphic-design': ['graphic design', 'visual identity', 'design', 'print'],
        'branding': ['branding', 'brand identity', 'logo', 'brand guidelines'],
        'photography': ['photography', 'photo', 'portrait', 'landscape', 'commercial'],
        'illustration': ['illustration', 'drawing', 'digital art', 'artwork'],
        'development': ['development', 'programming', 'coding', 'application', 'web']
      }
    };

    return keywords[language][category] || ['portfolio', 'creative', 'professional'];
  }
}