'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, ListPlus, LogOut, MessageSquare, ChevronLeft, ChevronRight, HelpCircle, Settings, Info } from 'lucide-react';
import { signOut } from '@/services/auth/sign-out';
import { Button } from '@/components/ui/button';
import { AboutDialog } from './about-dialog';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar_collapsed');
      if (stored) {
        setIsCollapsed(JSON.parse(stored));
      } else {
        setIsCollapsed(window.innerWidth < 768);
      }

      const handleResize = () => {
        if (window.innerWidth < 768) setIsCollapsed(true);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
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
    { href: '/settings', label: 'Pengaturan', icon: Settings },
    { href: '/help', label: 'Panduan', icon: HelpCircle },
  ];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0 transition-all duration-300 z-40 relative ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Floating Toggle Button on the border edge */}
      <button 
        onClick={toggleCollapse} 
        title={isCollapsed ? "Buka Sidebar" : "Lipat Sidebar"}
        className="absolute -right-3.5 top-5.5 z-[99] h-7 w-7 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:bg-[#ffcc00] hover:text-slate-950 hover:border-[#ffcc00] flex items-center justify-center shadow-lg transition-all hover:scale-110 shrink-0 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={`p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40 min-h-[73px] overflow-hidden ${
        isCollapsed ? 'justify-center' : 'justify-start'
      }`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sipaja.jpg" alt="SI-PAJA" className="h-8 w-8 object-cover rounded-md shrink-0" />
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0 transition-opacity duration-200">
            <h1 className="font-bold text-sm tracking-wide leading-tight text-white uppercase truncate">SI-PAJA</h1>
            <p className="text-[8px] tracking-widest text-amber-400 uppercase font-bold truncate">Pulau Taliabu</p>
          </div>
        )}
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

      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => setIsAboutOpen(true)}
          title="Tentang SI-PAJA"
          className={`flex items-center rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all duration-200 ${
            isCollapsed ? 'justify-center p-2.5 w-full' : 'space-x-3 px-4 py-3 w-full'
          }`}
        >
          <Info className="h-5 w-5 shrink-0 text-amber-500" />
          {!isCollapsed && <span>Tentang SI-PAJA</span>}
        </button>

        <button
          onClick={handleLogout}
          title="Keluar Aplikasi"
          className={`flex items-center rounded-lg text-sm font-medium text-slate-455 hover:text-rose-450 hover:bg-rose-950/20 transition-all duration-200 ${
            isCollapsed ? 'justify-center p-2.5 w-full' : 'space-x-3 px-4 py-3 w-full'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>

      <AboutDialog open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </aside>
  );
}
export default Sidebar;
