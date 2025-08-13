#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuration SmartPortfolio - APIs');
console.log('=====================================\n');

const envPath = path.join(__dirname, '../.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

async function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const fullQuestion = defaultValue 
      ? `${question} (défaut: ${defaultValue}): `
      : `${question}: `;
    
    rl.question(fullQuestion, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function updateEnvVariable(key, value) {
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}="${value}"`);
  } else {
    envContent += `\n${key}="${value}"`;
  }
}

async function setupOAuthGoogle() {
  console.log('\n📱 Configuration Google OAuth');
  console.log('➡️  Suivez ces étapes:');
  console.log('1. Allez sur https://console.cloud.google.com/');
  console.log('2. APIs & Services > Credentials');
  console.log('3. Create Credentials > OAuth 2.0 Client ID');
  console.log('4. Redirect URI: http://localhost:3003/api/auth/callback/google\n');

  const clientId = await prompt('Google Client ID');
  const clientSecret = await prompt('Google Client Secret');

  if (clientId && clientSecret) {
    updateEnvVariable('GOOGLE_CLIENT_ID', clientId);
    updateEnvVariable('GOOGLE_CLIENT_SECRET', clientSecret);
    console.log('✅ Google OAuth configuré');
  } else {
    console.log('⏭️  Google OAuth ignoré');
  }
}

async function setupOAuthGitHub() {
  console.log('\n🐙 Configuration GitHub OAuth');
  console.log('➡️  Suivez ces étapes:');
  console.log('1. Allez sur https://github.com/settings/developers');
  console.log('2. New OAuth App');
  console.log('3. Callback URL: http://localhost:3003/api/auth/callback/github\n');

  const clientId = await prompt('GitHub Client ID');
  const clientSecret = await prompt('GitHub Client Secret');

  if (clientId && clientSecret) {
    updateEnvVariable('GITHUB_CLIENT_ID', clientId);
    updateEnvVariable('GITHUB_CLIENT_SECRET', clientSecret);
    console.log('✅ GitHub OAuth configuré');
  } else {
    console.log('⏭️  GitHub OAuth ignoré');
  }
}

async function setupStripe() {
  console.log('\n💳 Configuration Stripe (mode test)');
  console.log('➡️  Suivez ces étapes:');
  console.log('1. Allez sur https://dashboard.stripe.com/');
  console.log('2. Créez un compte (restez en mode Test)');
  console.log('3. Developers > API Keys\n');

  const secretKey = await prompt('Stripe Secret Key (sk_test_...)');
  const publishableKey = await prompt('Stripe Publishable Key (pk_test_...)');

  if (secretKey && publishableKey) {
    updateEnvVariable('STRIPE_SECRET_KEY', secretKey);
    updateEnvVariable('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', publishableKey);
    console.log('✅ Stripe configuré');
  } else {
    console.log('⏭️  Stripe ignoré');
  }
}

async function setupOpenAI() {
  console.log('\n🤖 Configuration OpenAI API');
  console.log('➡️  Suivez ces étapes:');
  console.log('1. Allez sur https://platform.openai.com/');
  console.log('2. Créez un compte et ajoutez du crédit (5$ recommandé)');
  console.log('3. API Keys > Create new secret key\n');

  const apiKey = await prompt('OpenAI API Key (sk-...)');

  if (apiKey) {
    updateEnvVariable('OPENAI_API_KEY', apiKey);
    console.log('✅ OpenAI API configurée');
  } else {
    console.log('⏭️  OpenAI API ignorée');
  }
}

async function setupOptionalAPIs() {
  console.log('\n🎨 APIs optionnelles (Behance/Dribbble)');
  const setupOptional = await prompt('Configurer Behance/Dribbble maintenant? (y/N)', 'N');
  
  if (setupOptional.toLowerCase() === 'y') {
    const behanceKey = await prompt('Behance API Key (optionnel)');
    const dribbbleKey = await prompt('Dribbble API Key (optionnel)');

    if (behanceKey) updateEnvVariable('BEHANCE_API_KEY', behanceKey);
    if (dribbbleKey) updateEnvVariable('DRIBBBLE_API_KEY', dribbbleKey);
    
    console.log('✅ APIs optionnelles configurées');
  } else {
    console.log('⏭️  APIs optionnelles ignorées (vous pourrez les configurer plus tard)');
  }
}

async function main() {
  try {
    await setupOAuthGoogle();
    await setupOAuthGitHub();
    await setupStripe();
    await setupOpenAI();
    await setupOptionalAPIs();

    // Sauvegarder le fichier .env.local
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n🎉 Configuration terminée !');
    console.log('📁 Fichier mis à jour: .env.local');
    console.log('🔄 Redémarrez le serveur: npm run dev');
    console.log('\n🧪 Test des APIs:');
    console.log('➡️  http://localhost:3003/test');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

main();