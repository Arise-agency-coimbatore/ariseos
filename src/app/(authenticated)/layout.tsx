'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/store';
import { supabase } from '@/lib/supabase';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initialize = useAppStore(state => state.initialize);
  const isInitialized = useAppStore(state => state.isInitialized);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      if (!isInitialized) {
        await initialize();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router, initialize, isInitialized]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-navy-950">
        <div className="text-cyan-400 font-semibold animate-pulse text-xl">Loading AriseOS...</div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
