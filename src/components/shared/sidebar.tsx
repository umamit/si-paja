'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, ListPlus, LogOut, Droplets } from 'lucide-react';
import { signOut } from '@/services/auth/sign-out';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/map', label: 'Peta GIS', icon: Map },
    { href: '/segments', label: 'Segmen Drainase', icon: ListPlus },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <Droplets className="h-8 w-8 text-emerald-400 animate-pulse" />
        <div>
          <h1 className="font-bold text-lg leading-tight">PUPR Taliabu</h1>
          <p className="text-xs text-slate-400">SIG Drainase Bobong</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500 pl-3'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
