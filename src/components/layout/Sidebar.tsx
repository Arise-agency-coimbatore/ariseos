'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, Briefcase, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
// import { useAuthStore } from '@/store/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Clients', href: '/clients', icon: Briefcase },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full w-64 flex-col glass border-r border-navy-700/50">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-2xl font-bold text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          AriseOS
        </h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? 'bg-navy-800/80 text-white border border-navy-600/50 shadow-[0_0_15px_rgba(41,102,180,0.3)]'
                    : 'text-navy-200 hover:bg-navy-800/50 hover:text-white',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200'
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? 'text-cyan-400' : 'text-navy-300 group-hover:text-cyan-400',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 border-t border-navy-700/50 p-4">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-navy-200 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-navy-300 group-hover:text-red-400 transition-colors" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}
