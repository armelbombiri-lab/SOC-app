import { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white p-1">
        <Menu className="w-5 h-5" />
      </button>

      <button
        onClick={onSearchClick}
        className="flex-1 max-w-md flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 hover:border-slate-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Rechercher site, CVE, IP, région...</span>
      </button>

      <div className="flex-1" />

      <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
            {(user.full_name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm text-white font-medium leading-tight">{user.full_name || user.email}</div>
            <div className="text-[10px] text-slate-500 leading-tight">{ROLE_LABELS[user.role]}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-3 border-b border-slate-700">
                <div className="text-sm font-medium text-white">{user.full_name || 'Utilisateur'}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">{ROLE_LABELS[user.role]}</div>
              </div>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
