import { useState, useEffect } from 'react';
import { ShieldAlert, Search, Plus, X, User, Clock, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Incident, IncidentStatus, Site } from '@/lib/types';
import { SEVERITY_COLORS } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selected, setSelected] = useState<Incident | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    const [incRes, sitesRes] = await Promise.all([
      supabase.from('incidents').select('*'),
      supabase.from('sites').select('*'),
    ]);
    setIncidents(incRes.data || []);
    setSites(sitesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = incidents.filter((i) => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statusLabels: Record<string, string> = { open: 'Ouvert', investigating: 'Investigation', contained: 'Contenu', resolved: 'Résolu', closed: 'Fermé' };
  const statusColors: Record<string, string> = { open: 'red', investigating: 'orange', contained: 'yellow', resolved: 'emerald', closed: 'slate' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Incidents</h1>
          <p className="text-sm text-slate-400">{filtered.length} incidents</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Créer un incident
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Tous statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Toutes sévérités</option>
          <option value="critical">Critique</option>
          <option value="high">Élevé</option>
          <option value="medium">Moyen</option>
          <option value="low">Faible</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((inc) => (
          <button key={inc.id} onClick={() => setSelected(inc)} className="w-full flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-colors">
            <div className="w-1 h-12 rounded-full" style={{ background: SEVERITY_COLORS[inc.severity] }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{inc.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md bg-${statusColors[inc.status]}-500/20 text-${statusColors[inc.status]}-400`}>
                  {statusLabels[inc.status]}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 capitalize">{inc.category} · {inc.mitre_tactic || 'N/A'} · {timeAgo(inc.created_at)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs px-2 py-0.5 rounded-md capitalize" style={{ background: SEVERITY_COLORS[inc.severity] + '20', color: SEVERITY_COLORS[inc.severity] }}>{inc.severity}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && <IncidentDetail incident={selected} sites={sites} onClose={() => setSelected(null)} onUpdate={fetchData} />}
      {showAdd && <AddIncidentModal sites={sites} onClose={() => setShowAdd(false)} onAdded={fetchData} />}
    </div>
  );
}

function IncidentDetail({ incident, sites, onClose, onUpdate }: { incident: Incident; sites: Site[]; onClose: () => void; onUpdate: () => void }) {
  const [status, setStatus] = useState(incident.status);
  const site = sites.find((s) => s.id === incident.site_id);

  const update = async (newStatus: IncidentStatus) => {
    setStatus(newStatus);
    await supabase.from('incidents').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', incident.id);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{incident.title}</h2>
            <div className="text-xs text-slate-400 mt-1 capitalize">{incident.category} · {timeAgo(incident.created_at)}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-300 mb-4">{incident.description}</p>
        <div className="space-y-2 text-sm mb-4">
          <Row label="Sévérité" value={<span className="capitalize" style={{ color: SEVERITY_COLORS[incident.severity] }}>{incident.severity}</span>} />
          <Row label="Site" value={site?.name || '-'} />
          <Row label="MITRE Tactic" value={incident.mitre_tactic || '-'} />
          <Row label="IOC" value={incident.ioc || '-'} />
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Statut</div>
          <div className="flex flex-wrap gap-2">
            {(['open', 'investigating', 'contained', 'resolved', 'closed'] as IncidentStatus[]).map((s) => (
              <button key={s} onClick={() => update(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${status === s ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"><User className="w-4 h-4" /> Assigner</button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"><ArrowUp className="w-4 h-4" /> Escalader</button>
        </div>
      </div>
    </div>
  );
}

function AddIncidentModal({ sites, onClose, onAdded }: { sites: Site[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', status: 'open', category: 'intrusion', site_id: '', mitre_tactic: '', ioc: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from('incidents').insert({ ...form, timeline: [] });
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nouvel incident</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <input className="modal-input" placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="modal-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="modal-input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="critical">Critique</option><option value="high">Élevé</option><option value="medium">Moyen</option><option value="low">Faible</option>
            </select>
            <select className="modal-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="malware">Malware</option><option value="ransomware">Ransomware</option><option value="phishing">Phishing</option><option value="ddos">DDoS</option><option value="intrusion">Intrusion</option><option value="autre">Autre</option>
            </select>
            <select className="modal-input" value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}>
              <option value="">-</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="modal-input" placeholder="MITRE Tactic" value={form.mitre_tactic} onChange={(e) => setForm({ ...form, mitre_tactic: e.target.value })} />
          </div>
          <input className="modal-input" placeholder="IOC" value={form.ioc} onChange={(e) => setForm({ ...form, ioc: e.target.value })} />
          <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">{saving ? 'Création...' : 'Créer'}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between py-1 border-b border-slate-800/50"><span className="text-slate-400">{label}</span><span className="text-white">{value}</span></div>;
}
