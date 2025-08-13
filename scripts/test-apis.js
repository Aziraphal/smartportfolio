#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Test des APIs SmartPortfolio');
console.log('================================\n');

const tests = [];

function addTest(name, test) {
  tests.push({ name, test });
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Test Google OAuth
addTest('Google OAuth Configuration', async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || clientId === 'your-google-client-id') {
    return { success: false, message: 'Google Client ID non configuré' };
  }
  if (!clientSecret || clientSecret === 'your-google-client-secret') {
    return { success: false, message: 'Google Client Secret non configuré' };
  }
  
  // Test de base (vérification du format)
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    return { success: false, message: 'Format Google Client ID invalide' };
  }
  
  return { success: true, message: 'Configuration Google OAuth OK' };
});

// Test GitHub OAuth
addTest('GitHub OAuth Configuration', async () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!clientId || clientId === 'your-github-client-id') {
    return { success: false, message: 'GitHub Client ID non configuré' };
  }
  if (!clientSecret || clientSecret === 'your-github-client-secret') {
    return { success: false, message: 'GitHub Client Secret non configuré' };
  }
  
  return { success: true, message: 'Configuration GitHub OAuth OK' };
});

// Test Stripe
addTest('Stripe Configuration', async () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey || secretKey === 'sk_test_your-stripe-secret-key') {
    return { success: false, message: 'Stripe Secret Key non configurée' };
  }
  
  if (!secretKey.startsWith('sk_test_')) {
    return { success: false, message: 'Utilisez une clé Stripe TEST (sk_test_...)' };
  }
  
  try {
    const stripe = require('stripe')(secretKey);
    await stripe.balance.retrieve();
    return { success: true, message: 'Connexion Stripe réussie' };
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return { success: false, message: 'Module Stripe non installé (npm install stripe)' };
    }
    return { success: false, message: `Erreur Stripe: ${error.message}` };
  }
});

// Test OpenAI
addTest('OpenAI API Configuration', async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    return { success: false, message: 'OpenAI API Key non configurée' };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return { success: false, message: 'Format OpenAI API Key invalide (doit commencer par sk-)' };
  }
  
  try {
    const response = await makeRequest('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'SmartPortfolio-Test'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'OpenAI API accessible' };
    } else {
      return { success: false, message: `OpenAI API erreur: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Erreur connexion OpenAI: ${error.message}` };
  }
});

// Test Database
addTest('Database Configuration', async () => {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return { success: false, message: 'DATABASE_URL non configurée' };
  }
  
  if (!fs.existsSync('dev.db') && dbUrl.includes('file:')) {
    return { success: false, message: 'Base SQLite non créée (lancez: npx prisma db push)' };
  }
  
  return { success: true, message: 'Base de données configurée' };
});

// Test NextAuth
addTest('NextAuth Configuration', async () => {
  const secret = process.env.NEXTAUTH_SECRET;
  const url = process.env.NEXTAUTH_URL;
  
  if (!secret || secret === 'your-secret-key-here') {
    return { success: false, message: 'NEXTAUTH_SECRET non configuré' };
  }
  
  if (!url) {
    return { success: false, message: 'NEXTAUTH_URL non configurée' };
  }
  
  return { success: true, message: 'NextAuth configuré' };
});

async function runTests() {
  let passed = 0;
  let total = tests.length;
  
  for (const { name, test } of tests) {
    process.stdout.write(`Testing ${name}... `);
    
    try {
      const result = await test();
      if (result.success) {
        console.log(`✅ ${result.message}`);
        passed++;
      } else {
        console.log(`❌ ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
  
  console.log('\n📊 Résumé des tests:');
  console.log(`✅ ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('🎉 Toutes les APIs sont configurées !');
    console.log('🚀 Votre SmartPortfolio est prêt pour les tests complets');
  } else {
    console.log('⚠️  Certaines APIs nécessitent une configuration');
    console.log('➡️  Lancez: node scripts/setup-env.js');
  }
  
  // Recommandations
  console.log('\n💡 Prochaines étapes:');
  if (passed < total) {
    console.log('1. Configurez les APIs manquantes avec: node scripts/setup-env.js');
  }
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your-stripe-secret-key') {
    console.log('2. Créez les produits Stripe avec: node scripts/setup-stripe.js');
  }
  console.log('3. Testez l\'application sur: http://localhost:3003');
  console.log('4. Lancez les tests d\'intégration: http://localhost:3003/test');
}

runTests().catch(console.error);