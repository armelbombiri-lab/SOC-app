import { useState, useEffect } from 'react';
import { Plug, CheckCircle, XCircle, RefreshCw, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Connector } from '@/lib/types';
import { CONNECTOR_LABELS } from '@/lib/types';

export function Connectors() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('connectors').select('*');
    setConnectors(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const connected = connectors.filter((c) => c.status === 'connected').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Connecteurs</h1>
          <p className="text-sm text-slate-400">{connected}/{connectors.length} connecteurs actifs</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.status === 'connected' ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  <Plug className={`w-5 h-5 ${c.status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">{CONNECTOR_LABELS[c.type]}</div>
                </div>
              </div>
              {c.status === 'connected' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs text-slate-400 font-mono truncate mb-2">{c.endpoint}</div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${c.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{c.status}</span>
              <span className="text-slate-500">Sync: {c.sync_interval}s</span>
            </div>
            {c.last_sync && <div className="text-xs text-slate-600 mt-2">Dernière sync: {new Date(c.last_sync).toLocaleString('fr-FR')}</div>}
          </div>
        ))}
      </div>

      {showAdd && <AddConnectorModal onClose={() => setShowAdd(false)} onAdded={fetch} />}
    </div>
  );
}

function AddConnectorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'glpi', endpoint: '', sync_interval: 60 });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from('connectors').insert({ ...form, status: 'disconnected', is_active: false, config: {} });
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nouveau connecteur</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-slate-400 mb-1 block">Nom</label><input className="modal-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <select className="modal-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(CONNECTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Endpoint</label><input className="modal-input" value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Intervalle sync (s)</label><input type="number" className="modal-input" value={form.sync_interval} onChange={(e) => setForm({ ...form, sync_interval: parseInt(e.target.value) })} /></div>
          <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">{saving ? 'Création...' : 'Créer'}</button>
        </div>
      </div>
    </div>
  );
}
