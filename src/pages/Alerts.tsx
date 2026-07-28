import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Alert, Site } from '@/lib/types';
import { SEVERITY_COLORS } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    const [aRes, sRes] = await Promise.all([supabase.from('alerts').select('*'), supabase.from('sites').select('*')]);
    setAlerts(aRes.data || []);
    setSites(sRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const acknowledge = async (id: string) => {
    await supabase.from('alerts').update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  };

  const resolve = async (id: string) => {
    await supabase.from('alerts').update({ status: 'resolved' }).eq('id', id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statusLabels: Record<string, string> = { new: 'Nouvelle', acknowledged: 'Reconnue', resolved: 'Résolue', false_positive: 'Faux positif' };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Alertes temps réel</h1>
        <p className="text-sm text-slate-400">{filtered.length} alertes</p>
      </div>

      <div className="flex gap-3">
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Toutes sévérités</option>
          <option value="critical">Critique</option><option value="high">Élevé</option><option value="medium">Moyen</option><option value="low">Faible</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Tous statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((alert) => (
          <div key={alert.id} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-1 h-10 rounded-full" style={{ background: SEVERITY_COLORS[alert.severity] }} />
            <Bell className="w-4 h-4 text-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">{alert.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{statusLabels[alert.status]}</span>
              </div>
              <div className="text-xs text-slate-500">{alert.source} · {sites.find((s) => s.id === alert.site_id)?.name || '-'} · {timeAgo(alert.created_at)}</div>
            </div>
            {alert.status === 'new' && (
              <button onClick={() => acknowledge(alert.id)} className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-emerald-400" title="Reconnaître">
                <Check className="w-4 h-4" />
              </button>
            )}
            {alert.status !== 'resolved' && (
              <button onClick={() => resolve(alert.id)} className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-blue-400" title="Résoudre">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
