'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, ListPlus, LogOut, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { signOut } from '@/services/auth/sign-out';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar_collapsed');
      if (stored) setIsCollapsed(JSON.parse(stored));
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
  };

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
    { href: '/complaints', label: 'Aduan Warga', icon: MessageSquare },
  ];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40 min-h-[73px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-pupr.png" alt="PUPR" className="h-8 w-auto shrink-0 mx-auto" />
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0 transition-opacity duration-200">
            <h1 className="font-bold text-xs leading-tight truncate">PUPR Pulau Taliabu</h1>
            <p className="text-[9px] text-slate-400 truncate">SIG Drainase Bobong</p>
          </div>
        )}

        <button onClick={toggleCollapse} className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-colors shrink-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-4 py-3'
              } ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500 pl-3'
                  : 'hover:bg-slate-800/50 text-slate-450 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          title="Keluar Aplikasi"
          className={`flex items-center rounded-lg text-sm font-medium text-slate-450 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200 ${
            isCollapsed ? 'justify-center p-2.5 w-full' : 'space-x-3 px-4 py-3 w-full'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
