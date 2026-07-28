import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Cartography } from '@/pages/Cartography';
import { SitesManagement } from '@/pages/SitesManagement';
import { Vulnerabilities } from '@/pages/Vulnerabilities';
import { Incidents } from '@/pages/Incidents';
import { Alerts } from '@/pages/Alerts';
import { Compliance } from '@/pages/Compliance';
import { Monitoring } from '@/pages/Monitoring';
import { ThreatIntel } from '@/pages/ThreatIntel';
import { Connectors } from '@/pages/Connectors';
import { Reports } from '@/pages/Reports';
import { UserManagement } from '@/pages/UserManagement';
import { GlobalSearch } from '@/pages/GlobalSearch';
import { LoginPage } from '@/pages/LoginPage';

export type PageId =
  | 'dashboard'
  | 'cartography'
  | 'sites'
  | 'vulnerabilities'
  | 'incidents'
  | 'alerts'
  | 'compliance'
  | 'monitoring'
  | 'threat_intel'
  | 'connectors'
  | 'reports'
  | 'users'
  | 'search';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'cartography': return <Cartography />;
      case 'sites': return <SitesManagement />;
      case 'vulnerabilities': return <Vulnerabilities />;
      case 'incidents': return <Incidents />;
      case 'alerts': return <Alerts />;
      case 'compliance': return <Compliance />;
      case 'monitoring': return <Monitoring />;
      case 'threat_intel': return <ThreatIntel />;
      case 'connectors': return <Connectors />;
      case 'reports': return <Reports />;
      case 'users': return <UserManagement />;
      case 'search': return <GlobalSearch onNavigate={setCurrentPage} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setCurrentPage('search')}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
