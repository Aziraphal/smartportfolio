import jsPDF from 'jspdf';

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
    achievements?: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
}

export class CVGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private lineHeight: number = 6;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }

  private addNewPageIfNeeded(spaceNeeded: number): void {
    if (this.currentY + spaceNeeded > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addText(text: string, x: number, fontSize: number = 10, style: string = 'normal'): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', style);
    this.pdf.text(text, x, this.currentY);
    this.currentY += this.lineHeight;
  }

  private addSection(title: string): void {
    this.addNewPageIfNeeded(15);
    this.currentY += 5; // Extra space before section
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    
    // Add underline
    const textWidth = this.pdf.getTextWidth(title);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY + 1, this.margin + textWidth, this.currentY + 1);
    
    this.currentY += this.lineHeight + 2;
  }

  private splitText(text: string, maxWidth: number): string[] {
    return this.pdf.splitTextToSize(text, maxWidth);
  }

  generateCV(data: CVData): jsPDF {
    // Header with personal info
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(data.personalInfo.name, this.margin, this.currentY);
    this.currentY += 10;

    // Contact info
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const contactInfo = [];
    if (data.personalInfo.email) contactInfo.push(data.personalInfo.email);
    if (data.personalInfo.phone) contactInfo.push(data.personalInfo.phone);
    if (data.personalInfo.location) contactInfo.push(data.personalInfo.location);
    
    this.pdf.text(contactInfo.join(' • '), this.margin, this.currentY);
    this.currentY += this.lineHeight;

    // Links
    const links = [];
    if (data.personalInfo.website) links.push(data.personalInfo.website);
    if (data.personalInfo.linkedin) links.push(data.personalInfo.linkedin);
    if (data.personalInfo.github) links.push(data.personalInfo.github);
    
    if (links.length > 0) {
      this.pdf.text(links.join(' • '), this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    // Summary
    if (data.summary) {
      this.addSection('PROFIL PROFESSIONNEL');
      const summaryLines = this.splitText(data.summary, 170);
      summaryLines.forEach(line => {
        this.addText(line, this.margin);
      });
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      this.addSection('EXPÉRIENCE PROFESSIONNELLE');
      
      data.experience.forEach(exp => {
        this.addNewPageIfNeeded(25);
        
        // Job title and company
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(exp.title, this.margin, this.currentY);
        
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(exp.company, this.margin + 80, this.currentY);
        
        // Period (right-aligned)
        this.pdf.text(exp.period, 190 - this.pdf.getTextWidth(exp.period), this.currentY);
        this.currentY += this.lineHeight + 1;

        // Description
        this.pdf.setFontSize(10);
        const descLines = this.splitText(exp.description, 170);
        descLines.forEach(line => {
          this.addText(line, this.margin + 5);
        });

        // Achievements
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach(achievement => {
            this.addText(`• ${achievement}`, this.margin + 10, 10);
          });
        }

        this.currentY += 3; // Space between experiences
      });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      this.addSection('COMPÉTENCES');
      
      data.skills.forEach(skillCategory => {
        this.addNewPageIfNeeded(10);
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(skillCategory.category + ':', this.margin, this.currentY);
        this.currentY += this.lineHeight;

        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        const skillsText = skillCategory.items.join(', ');
        const skillLines = this.splitText(skillsText, 160);
        skillLines.forEach(line => {
          this.addText(line, this.margin + 5);
        });
        
        this.currentY += 2;
      });
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
      this.addSection('PROJETS SÉLECTIONNÉS');
      
      data.projects.slice(0, 5).forEach(project => {
        this.addNewPageIfNeeded(20);
        
        // Project name
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(project.name, this.margin, this.currentY);
        
        if (project.url) {
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(9);
          this.pdf.text(project.url, this.margin + 80, this.currentY);
        }
        
        this.currentY += this.lineHeight;

        // Description
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        const projectLines = this.splitText(project.description, 170);
        projectLines.forEach(line => {
          this.addText(line, this.margin + 5);
        });

        // Technologies
        if (project.technologies && project.technologies.length > 0) {
          this.pdf.setFontSize(9);
          this.pdf.setFont('helvetica', 'italic');
          const techText = 'Technologies: ' + project.technologies.join(', ');
          this.addText(techText, this.margin + 5, 9, 'italic');
        }
        
        this.currentY += 3;
      });
    }

    // Education
    if (data.education && data.education.length > 0) {
      this.addSection('FORMATION');
      
      data.education.forEach(edu => {
        this.addNewPageIfNeeded(10);
        
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(edu.degree, this.margin, this.currentY);
        
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(edu.institution, this.margin + 80, this.currentY);
        
        // Period
        this.pdf.text(edu.period, 190 - this.pdf.getTextWidth(edu.period), this.currentY);
        this.currentY += this.lineHeight + 2;
      });
    }

    return this.pdf;
  }

  static portfolioToCV(portfolio: any): CVData {
    // Extract skills from project tags
    const allTags = portfolio.projects.flatMap((p: any) => p.tags);
    const skillCounts = allTags.reduce((acc: any, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // Group skills by category
    const techSkills = Object.keys(skillCounts)
      .filter(skill => this.isTechSkill(skill))
      .sort((a, b) => skillCounts[b] - skillCounts[a]);

    const designSkills = Object.keys(skillCounts)
      .filter(skill => this.isDesignSkill(skill))
      .sort((a, b) => skillCounts[b] - skillCounts[a]);

    const tools = Object.keys(skillCounts)
      .filter(skill => this.isToolSkill(skill))
      .sort((a, b) => skillCounts[b] - skillCounts[a]);

    // Create experience from projects
    const experience = [{
      title: this.guessJobTitle(portfolio.projects),
      company: 'Freelance / Projets personnels',
      period: `${new Date().getFullYear() - 2} - Présent`,
      description: `Développement et design de ${portfolio.projects.length} projets créatifs et techniques.`,
      achievements: portfolio.projects
        .filter((p: any) => p.featured)
        .slice(0, 3)
        .map((p: any) => `${p.title}: ${p.description.substring(0, 80)}...`)
    }];

    return {
      personalInfo: {
        name: portfolio.user.name || portfolio.title.replace('Portfolio de ', ''),
        email: portfolio.user.email,
        website: `${portfolio.subdomain}.smartportfolio.com`,
        github: this.extractGithubUsername(portfolio.projects),
        linkedin: '', // Could be extracted from integrations
      },
      summary: portfolio.description || 
        `${this.guessJobTitle(portfolio.projects)} passionné(e) avec une expérience dans ${techSkills.concat(designSkills).slice(0, 3).join(', ')}. Spécialisé(e) dans la création de solutions innovantes et l'optimisation de l'expérience utilisateur.`,
      experience,
      skills: [
        ...(techSkills.length > 0 ? [{ category: 'Technologies', items: techSkills.slice(0, 8) }] : []),
        ...(designSkills.length > 0 ? [{ category: 'Design', items: designSkills.slice(0, 6) }] : []),
        ...(tools.length > 0 ? [{ category: 'Outils', items: tools.slice(0, 6) }] : [])
      ],
      projects: portfolio.projects
        .sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 6)
        .map((project: any) => ({
          name: project.title,
          description: project.description,
          technologies: project.tags.slice(0, 4),
          url: project.projectUrl
        }))
    };
  }

  private static guessJobTitle(projects: any[]): string {
    const categories = projects.map(p => p.category);
    const tags = projects.flatMap(p => p.tags);
    
    if (tags.some(tag => ['React', 'JavaScript', 'Node.js', 'Python'].includes(tag))) {
      return 'Développeur Full-Stack';
    }
    if (categories.some(cat => cat.includes('design'))) {
      return 'Designer UI/UX';
    }
    if (tags.some(tag => ['GitHub', 'development'].includes(tag))) {
      return 'Développeur';
    }
    return 'Créatif Digital';
  }

  private static isTechSkill(skill: string): boolean {
    const techSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 
      'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Docker', 'Kubernetes'
    ];
    return techSkills.includes(skill);
  }

  private static isDesignSkill(skill: string): boolean {
    const designSkills = [
      'UI/UX', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 
      'InDesign', 'After Effects', 'Design', 'Branding', 'Typography'
    ];
    return designSkills.includes(skill);
  }

  private static isToolSkill(skill: string): boolean {
    const tools = [
      'Git', 'GitHub', 'GitLab', 'Jira', 'Slack', 'Notion', 'Figma', 
      'VS Code', 'Postman', 'Chrome DevTools'
    ];
    return tools.includes(skill);
  }

  private static extractGithubUsername(projects: any[]): string {
    for (const project of projects) {
      if (project.sourceUrl && project.sourceUrl.includes('github.com')) {
        const match = project.sourceUrl.match(/github\.com\/([^\/]+)/);
        if (match) return `github.com/${match[1]}`;
      }
    }
    return '';
  }
}