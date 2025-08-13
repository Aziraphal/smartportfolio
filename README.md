# SmartPortfolio

SmartPortfolio est un SaaS qui permet aux créatifs de générer automatiquement un portfolio à jour en connectant leurs comptes Behance, GitHub et Dribbble. L'IA intégrée optimise les descriptions pour le SEO.

## 🚀 Fonctionnalités

### MVP (Phase 1-2)
- ✅ **Générateur de portfolio statique** - Interface pour créer manuellement un portfolio
- ✅ **Intégrations multi-plateformes** - Connexion automatique avec Behance, GitHub, Dribbble
- ✅ **Optimisation IA SEO** - Descriptions automatiquement optimisées avec GPT-4
- ✅ **Système freemium** - Plans gratuit, Pro et Équipe avec limitations claires

### Roadmap (Phase 3-4)
- 🔄 **Authentification NextAuth.js** - Connexion sécurisée
- 🔄 **Base de données Prisma + PostgreSQL** - Stockage des données
- 🔄 **Synchronisation automatique** - Mise à jour en temps réel des projets
- 🔄 **Thèmes personnalisables** - Templates de portfolio variés
- 🔄 **Domaines personnalisés** - Hébergement sur domaine propre
- 🔄 **Analytics** - Suivi des performances du portfolio

## 🛠️ Stack Technique

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de données**: PostgreSQL
- **Authentification**: NextAuth.js
- **IA**: OpenAI GPT-4o-mini
- **Déploiement**: Vercel
- **Paiements**: Stripe (à venir)

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/smartportfolio.git
cd smartportfolio

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local

# Lancer en développement
npm run dev
```

## ⚙️ Configuration

Créez un fichier `.env.local` avec :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/smartportfolio"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI pour l'IA SEO
OPENAI_API_KEY="your-openai-api-key-here"

# APIs des plateformes
BEHANCE_CLIENT_ID="your-behance-client-id"
BEHANCE_CLIENT_SECRET="your-behance-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

DRIBBBLE_CLIENT_ID="your-dribbble-client-id"
DRIBBBLE_CLIENT_SECRET="your-dribbble-client-secret"
```

## 🏗️ Architecture

```
src/
├── app/                    # Pages Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── create/            # Générateur de portfolio
│   ├── pricing/           # Page tarifs
│   └── api/               # API Routes
├── components/            # Composants React
│   ├── PortfolioGenerator.tsx
│   └── PricingSection.tsx
├── lib/                   # Logique métier
│   ├── integrations/      # APIs externes
│   │   ├── github.ts
│   │   ├── behance.ts
│   │   ├── dribbble.ts
│   │   └── sync.ts
│   ├── ai/               # IA et SEO
│   │   └── seo-optimizer.ts
│   └── subscription/     # Système d'abonnement
│       └── plans.ts
└── prisma/               # Base de données
    └── schema.prisma
```

## 🎯 Business Model

### Plans d'abonnement

| Plan     | Prix     | Projets | Intégrations | IA SEO | Domaine |
|----------|----------|---------|--------------|--------|---------|
| Gratuit  | 0€       | 5       | 2            | ❌     | ❌      |
| Pro      | 9€/mois  | ∞       | ∞            | ✅     | ✅      |
| Équipe   | 25€/mois | ∞       | ∞            | ✅     | 5       |

### Différenciateurs

1. **Automatisation totale** - Zéro maintenance manuelle
2. **IA SEO intégrée** - Descriptions optimisées automatiquement  
3. **Multi-plateformes** - GitHub + Behance + Dribbble en un seul endroit
4. **Mise à jour temps réel** - Portfolio toujours synchronisé

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Déployer sur Vercel
vercel deploy

# Configurer la base de données
npx prisma migrate deploy
npx prisma generate
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- Documentation : [docs.smartportfolio.com](https://docs.smartportfolio.com)
- Support : [support@smartportfolio.com](mailto:support@smartportfolio.com)
- Twitter : [@SmartPortfolio](https://twitter.com/SmartPortfolio)
