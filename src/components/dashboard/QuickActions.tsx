'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuickActions() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Rafraîchir la page pour voir les nouveaux projets
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Erreur de synchronisation: ${error.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSyncing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Synchronisation...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Synchroniser
          </>
        )}
      </button>

      <Link
        href="/create"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nouveau Portfolio
      </Link>
    </div>
  );
}