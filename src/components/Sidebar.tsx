import {
  LayoutDashboard,
  Map,
  Building2,
  ShieldAlert,
  Bell,
  FileCheck,
  Activity,
  Bug,
  Plug,
  FileText,
  Users,
  X,
  Shield,
  Upload,
} from 'lucide-react';
import type { PageId } from '@/App';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS, hasPermission } from '@/lib/supabase';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
  permission: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: 'dashboards' },
  { id: 'cartography', label: 'Cartographie', icon: Map, permission: 'sites' },
  { id: 'sites', label: 'Sites', icon: Building2, permission: 'sites' },
  { id: 'vulnerabilities', label: 'Vulnérabilités', icon: Bug, permission: 'vulnerabilities' },
  { id: 'incidents', label: 'Incidents', icon: ShieldAlert, permission: 'incidents' },
  { id: 'alerts', label: 'Alertes', icon: Bell, permission: 'alerts' },
  { id: 'compliance', label: 'Conformité', icon: FileCheck, permission: 'compliance' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, permission: 'monitoring' },
  { id: 'threat_intel', label: 'Threat Intel', icon: ShieldAlert, permission: 'threat_intel' },
  { id: 'connectors', label: 'Connecteurs', icon: Plug, permission: 'connectors' },
  { id: 'reports', label: 'Rapports', icon: FileText, permission: 'reports' },
  { id: 'users', label: 'Utilisateurs', icon: Users, permission: 'users' },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onNavigate, open, onClose }: SidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(user.role, item.permission));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">Faso Nifri</div>
              <div className="text-[10px] text-slate-400 leading-tight">National SOC Monitoring</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.full_name || user.email}</div>
              <div className="text-[10px] text-slate-500">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
