#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Déploiement SmartPortfolio en Production');
console.log('============================================\n');

// Vérifications pré-déploiement
console.log('🔍 Vérifications pré-déploiement...\n');

// 1. Vérifier que le code est prêt
try {
  console.log('📦 Installation des dépendances...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('🔨 Build de production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build réussie\n');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}

// 2. Vérifier les variables d'environnement essentielles
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n➡️  Configurez les variables avant de déployer');
  process.exit(1);
}

console.log('✅ Variables d\'environnement OK\n');

// 3. Instructions de déploiement
console.log('📋 Prochaines étapes manuelles:\n');
console.log('1. 🗄️  Créer la base PostgreSQL (Supabase/Neon/Railway)');
console.log('2. 🚀 Déployer sur Vercel/Netlify');
console.log('3. 🔧 Configurer les variables d\'environnement');
console.log('4. 🔄 Migrer la base: npx prisma db push');
console.log('5. 🧪 Tester la production\n');

console.log('💡 Commandes utiles:');
console.log('   - Vercel: npx vercel --prod');
console.log('   - Netlify: npx netlify deploy --prod');
console.log('   - Migration DB: npx prisma db push\n');

console.log('🎉 Code prêt pour la production !');