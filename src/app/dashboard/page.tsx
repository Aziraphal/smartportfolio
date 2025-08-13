import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import CVGenerationCard from '@/components/dashboard/CVGenerationCard';
import IntegrationsCard from '@/components/dashboard/IntegrationsCard';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import QuickActions from '@/components/dashboard/QuickActions';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Récupérer les données utilisateur complètes
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      portfolios: {
        include: {
          projects: {
            select: {
              id: true,
              title: true,
              featured: true,
              source: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          integrations: {
            select: {
              platform: true,
              isActive: true,
              lastSync: true
            }
          },
          _count: {
            select: {
              projects: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      },
      subscription: true,
      _count: {
        select: {
          portfolios: true
        }
      }
    }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const currentPlan = user.subscription?.planId || 'free';
  const hasActiveSubscription = user.subscription?.status === 'active';

  return (
    <DashboardLayout user={user} currentPlan={currentPlan}>
      <div className="space-y-6">
        {/* Header avec actions rapides */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Bienvenue, {user.name || 'Utilisateur'} !
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Alerte upgrade si nécessaire */}
        {!hasActiveSubscription && user._count.portfolios > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Débloquez tout le potentiel de SmartPortfolio
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Passez au plan Pro pour accéder aux intégrations illimitées, à l'IA SEO et à la génération de CV.
                </p>
                <div className="mt-3">
                  <a
                    href="/pricing"
                    className="text-sm font-medium text-yellow-800 underline hover:no-underline"
                  >
                    Voir les plans →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioOverview 
              portfolios={user.portfolios}
              currentPlan={currentPlan}
            />
            <CVGenerationCard />
            <AnalyticsCard portfolios={user.portfolios} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionCard 
              subscription={user.subscription}
              currentPlan={currentPlan}
            />
            <IntegrationsCard 
              portfolios={user.portfolios}
              currentPlan={currentPlan}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}