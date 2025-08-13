#!/usr/bin/env node

const stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function createStripeProducts() {
  console.log('💳 Configuration des produits Stripe...\n');

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your-stripe-secret-key') {
    console.log('❌ STRIPE_SECRET_KEY non configurée');
    console.log('➡️  Lancez d\'abord: node scripts/setup-env.js');
    return;
  }

  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Créer le produit Pro
    console.log('📦 Création du produit Pro...');
    const proProduct = await stripeClient.products.create({
      name: 'SmartPortfolio Pro',
      description: 'Plan professionnel pour créatifs indépendants',
      metadata: {
        plan: 'pro'
      }
    });

    // 2. Créer les prix Pro
    const proMonthly = await stripeClient.prices.create({
      unit_amount: 900, // 9€
      currency: 'eur',
      recurring: { interval: 'month' },
      product: proProduct.id,
      metadata: {
        plan: 'pro',
        interval: 'monthly'
      }
    });

    const proYearly = await stripeClient.prices.create({
      unit_amount: 8640, // 86.40€ (20% de réduction)
      currency: 'eur',
      recurring: { interval: 'year' },
      product: proProduct.id,
      metadata: {
        plan: 'pro',
        interval: 'yearly'
      }
    });

    // 3. Créer le produit Team
    console.log('📦 Création du produit Team...');
    const teamProduct = await stripeClient.products.create({
      name: 'SmartPortfolio Team',
      description: 'Plan équipe pour agences et studios créatifs',
      metadata: {
        plan: 'team'
      }
    });

    // 4. Créer les prix Team
    const teamMonthly = await stripeClient.prices.create({
      unit_amount: 2500, // 25€
      currency: 'eur',
      recurring: { interval: 'month' },
      product: teamProduct.id,
      metadata: {
        plan: 'team',
        interval: 'monthly'
      }
    });

    const teamYearly = await stripeClient.prices.create({
      unit_amount: 24000, // 240€ (20% de réduction)
      currency: 'eur',
      recurring: { interval: 'year' },
      product: teamProduct.id,
      metadata: {
        plan: 'team',
        interval: 'yearly'
      }
    });

    // 5. Mettre à jour le fichier .env.local
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '../.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    function updateEnvVariable(key, value) {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}="${value}"`);
      } else {
        envContent += `\n${key}="${value}"`;
      }
    }

    updateEnvVariable('STRIPE_PRO_MONTHLY_PRICE_ID', proMonthly.id);
    updateEnvVariable('STRIPE_PRO_YEARLY_PRICE_ID', proYearly.id);
    updateEnvVariable('STRIPE_TEAM_MONTHLY_PRICE_ID', teamMonthly.id);
    updateEnvVariable('STRIPE_TEAM_YEARLY_PRICE_ID', teamYearly.id);

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Produits Stripe créés avec succès !\n');
    console.log('📋 Résumé:');
    console.log(`├── Pro Monthly: ${proMonthly.id} (9€/mois)`);
    console.log(`├── Pro Yearly:  ${proYearly.id} (86.40€/an)`);
    console.log(`├── Team Monthly: ${teamMonthly.id} (25€/mois)`);
    console.log(`└── Team Yearly:  ${teamYearly.id} (240€/an)`);
    console.log('\n📁 IDs sauvegardés dans .env.local');
    console.log('🔄 Redémarrez le serveur pour prendre en compte les changements');

  } catch (error) {
    console.error('❌ Erreur lors de la création des produits:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('➡️  Vérifiez votre STRIPE_SECRET_KEY dans .env.local');
    }
  }
}

// Vérifier que Stripe est installé
try {
  require('stripe');
} catch (error) {
  console.log('📦 Installation de Stripe...');
  console.log('Lancez: npm install stripe');
  process.exit(1);
}

createStripeProducts();