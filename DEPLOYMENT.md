# 🚀 Guide de Déploiement SmartPortfolio

## 📋 Checklist de déploiement

### 1. 🗄️ Base de données PostgreSQL

Choisissez un fournisseur :

**Option A - Supabase (Recommandé)**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL de connexion dans Settings → Database
4. Format : `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

**Option B - Neon**
1. Allez sur [neon.tech](https://neon.tech)
2. Créez une base de données
3. Récupérez l'URL de connexion

**Option C - Railway**
1. Allez sur [railway.app](https://railway.app)
2. Créez un service PostgreSQL
3. Récupérez l'URL de connexion

### 2. 🚀 Déploiement Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

**Configuration Vercel :**
1. Connectez votre repository GitHub
2. Framework Preset : Next.js
3. Build Command : `npm run build`
4. Output Directory : `.next`
5. Install Command : `npm ci`

### 3. 🔧 Variables d'environnement

Ajoutez ces variables dans votre plateforme de déploiement :

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="your-secret-32-chars-min"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# APIs
OPENAI_API_KEY="sk-..."

# Stripe LIVE
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 4. 🔄 Migration de la base

Après déploiement :

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma
npx prisma db push

# (Optionnel) Voir la base
npx prisma studio
```

### 5. 🔗 Mise à jour OAuth

**Google OAuth :**
1. [Google Cloud Console](https://console.cloud.google.com)
2. Ajouter votre domaine aux URLs autorisées :
   - `https://votre-domaine.com`
   - `https://votre-domaine.com/api/auth/callback/google`

**GitHub OAuth :**
1. [GitHub Settings](https://github.com/settings/developers)
2. Mettre à jour les URLs :
   - Homepage URL : `https://votre-domaine.com`
   - Authorization callback : `https://votre-domaine.com/api/auth/callback/github`

### 6. 💳 Stripe Production

1. Passer en mode Live dans le dashboard Stripe
2. Créer les produits en production avec : `node scripts/setup-stripe.js`
3. Configurer les webhooks : `https://votre-domaine.com/api/webhooks/stripe`

### 7. 🧪 Tests de production

Vérifiez :
- [ ] Authentification Google/GitHub
- [ ] Création de compte
- [ ] Paiements Stripe
- [ ] Génération de CV IA
- [ ] Performance et SEO

## 🛠️ Scripts utiles

```bash
# Build local pour tester
npm run build
npm start

# Déploiement automatique
node scripts/deploy-prod.js

# Test des APIs
node scripts/test-apis.js
```

## 🔧 Dépannage

### Erreur de base de données
```bash
npx prisma db push --force-reset
npx prisma generate
```

### Variables d'environnement
Vérifiez que toutes les variables requises sont définies dans votre plateforme de déploiement.

### OAuth ne fonctionne pas
Vérifiez que les URLs de redirection correspondent exactement à votre domaine de production.

## 📊 Monitoring

Configurez (optionnel) :
- **Sentry** pour le monitoring d'erreurs
- **Google Analytics** pour les statistiques
- **Stripe Dashboard** pour les métriques de paiement

---

🎉 **SmartPortfolio est prêt pour la production !**