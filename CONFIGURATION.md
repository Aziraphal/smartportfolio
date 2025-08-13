# 🔧 Configuration SmartPortfolio

Ce guide vous accompagne pour configurer toutes les APIs nécessaires au fonctionnement complet de SmartPortfolio.

## 🎯 Vue d'ensemble

**Status actuel :**
- ✅ Application démarrée sur http://localhost:3003
- ✅ Base de données SQLite configurée
- ✅ NextAuth.js avec SessionProvider
- ⚠️ APIs externes à configurer

## 🚀 Configuration automatique

### Étape 1 : Test des configurations actuelles
```bash
node scripts/test-apis.js
```

### Étape 2 : Configuration interactive des APIs
```bash
node scripts/setup-env.js
```

### Étape 3 : Création des produits Stripe (après config Stripe)
```bash
node scripts/setup-stripe.js
```

### Étape 4 : Test final
```bash
node scripts/test-apis.js
```

## 📋 Configuration manuelle

Si vous préférez configurer manuellement, voici les étapes détaillées :

### 1. 🔐 Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un existant
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Configuration :
   - **Application type** : Web application
   - **Authorized redirect URIs** : `http://localhost:3003/api/auth/callback/google`
   - **Authorized JavaScript origins** : `http://localhost:3003`
5. Copiez les clés dans `.env.local` :
```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
```

### 2. 🐙 GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. **New OAuth App**
3. Configuration :
   - **Application name** : SmartPortfolio Local
   - **Homepage URL** : `http://localhost:3003`
   - **Authorization callback URL** : `http://localhost:3003/api/auth/callback/github`
4. Copiez les clés dans `.env.local` :
```bash
GITHUB_CLIENT_ID="Iv1.your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

### 3. 💳 Stripe (mode test)

1. Créez un compte sur [Stripe Dashboard](https://dashboard.stripe.com/)
2. Restez en mode **Test** (bande orange)
3. **Developers** → **API Keys**
4. Copiez les clés dans `.env.local` :
```bash
STRIPE_SECRET_KEY="sk_test_your-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
```
5. Lancez le script pour créer les produits :
```bash
node scripts/setup-stripe.js
```

### 4. 🤖 OpenAI API

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Ajoutez du crédit (5$ minimum recommandé)
3. **API Keys** → **Create new secret key**
4. Copiez la clé dans `.env.local` :
```bash
OPENAI_API_KEY="sk-your-api-key"
```

### 5. 🎨 APIs optionnelles

Ces APIs sont optionnelles mais permettent les intégrations complètes :

**Behance API :**
```bash
BEHANCE_API_KEY="your-behance-key"
```

**Dribbble API :**
```bash
DRIBBBLE_API_KEY="your-dribbble-key"
```

## ✅ Vérification

Après configuration, vérifiez que tout fonctionne :

1. **Test des APIs** :
   ```bash
   node scripts/test-apis.js
   ```

2. **Interface de test** :
   ```
   http://localhost:3003/test
   ```

3. **Test d'authentification** :
   ```
   http://localhost:3003/auth/signin
   ```

4. **Test des paiements** :
   ```
   http://localhost:3003/pricing
   ```

## 🐛 Dépannage

### Erreur "Module not found"
```bash
npm install
```

### Erreur Prisma
```bash
npx prisma generate
npx prisma db push
```

### Port déjà utilisé
Le serveur utilise automatiquement le port suivant disponible (3003, 3004, etc.)

### Variables d'environnement non prises en compte
Redémarrez le serveur après modification de `.env.local` :
```bash
# Arrêtez avec Ctrl+C puis relancez :
npm run dev
```

## 🎉 Résultat attendu

Une fois tout configuré, vous devriez avoir :

- ✅ Authentification Google/GitHub fonctionnelle
- ✅ Paiements Stripe en mode test
- ✅ IA SEO avec OpenAI
- ✅ Dashboard complet accessible
- ✅ Génération CV AI (plans premium)
- ✅ Système de limitations par plan
- ✅ Tests d'intégration qui passent

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur dans votre terminal
2. Consultez la page de tests : http://localhost:3003/test
3. Relancez les scripts de test : `node scripts/test-apis.js`

**SmartPortfolio est maintenant prêt pour une démonstration complète !** 🚀