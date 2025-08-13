-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subdomain" TEXT,
    "customDomain" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "lastCvGeneration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalDescription" TEXT,
    "seoDescription" TEXT,
    "imageUrl" TEXT,
    "projectUrl" TEXT,
    "sourceUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "lastSync" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB DEFAULT {},
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "integrations_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" DATETIME,
    "stripeCurrentPeriodStart" DATETIME,
    "stripeCustomerId" TEXT,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stripe_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_subdomain_key" ON "portfolios"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_customDomain_key" ON "portfolios"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_portfolioId_platform_key" ON "integrations"("portfolioId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_events_stripeEventId_key" ON "stripe_events"("stripeEventId");
