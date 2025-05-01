'use client';

import { useSession } from 'next-auth/react';
import SuperAdminSidebar from '@/app/components/SuperAdminSidebar';

export default function SuperAdminLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null; // Will be handled by middleware
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SuperAdminSidebar session={session} />
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}