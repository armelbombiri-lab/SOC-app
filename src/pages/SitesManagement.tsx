import { useState, useEffect } from 'react';
import { Building2, Search, Plus, X, Shield, Server, Bug, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Site, Region, SiteType, RiskLevel } from '@/lib/types';
import { SITE_TYPE_LABELS, RISK_COLORS } from '@/lib/types';
import { calculateCyberScore, riskLevelFromScore, scoreColor } from '@/lib/utils';

export function SitesManagement() {
  const [sites, setSites] = useState<Site[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sitesRes, regionsRes] = await Promise.all([
      supabase.from('sites').select('*'),
      supabase.from('regions').select('*'),
    ]);
    setSites(sitesRes.data || []);
    setRegions(regionsRes.data || []);
    setLoading(false);
  };

  const filtered = sites.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.ministere?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterRisk !== 'all' && s.risk_level !== filterRisk) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des sites</h1>
          <p className="text-sm text-slate-400">{filtered.length} sites</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un site
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">Tous types</option>
          {Object.entries(SITE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">Tous risques</option>
          <option value="critical">Critique</option>
          <option value="high">Élevé</option>
          <option value="medium">Moyen</option>
          <option value="low">Faible</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((site) => (
          <button
            key={site.id}
            onClick={() => setSelectedSite(site)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{site.name}</div>
                  <div className="text-xs text-slate-500">{SITE_TYPE_LABELS[site.type]}</div>
                </div>
              </div>
              <div
                className="px-2 py-0.5 rounded-md text-xs font-medium capitalize"
                style={{ background: RISK_COLORS[site.risk_level] + '20', color: RISK_COLORS[site.risk_level] }}
              >
                {site.risk_level === 'critical' ? 'Critique' : site.risk_level === 'high' ? 'Élevé' : site.risk_level === 'medium' ? 'Moyen' : 'Faible'}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold" style={{ color: scoreColor(site.cyber_score) }}>{site.cyber_score}</div>
                <div className="text-[10px] text-slate-500">Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{site.equipment_count}</div>
                <div className="text-[10px] text-slate-500">Équip.</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">{site.vuln_count}</div>
                <div className="text-[10px] text-slate-500">Vuln.</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{site.incident_count}</div>
                <div className="text-[10px] text-slate-500">Inc.</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              {site.commune}, {site.province}
            </div>
          </button>
        ))}
      </div>

      {selectedSite && <SiteDetailModal site={selectedSite} regions={regions} onClose={() => setSelectedSite(null)} onUpdate={fetchData} />}
      {showAdd && <AddSiteModal regions={regions} onClose={() => setShowAdd(false)} onAdded={fetchData} />}
    </div>
  );
}

function SiteDetailModal({ site, regions, onClose, onUpdate }: { site: Site; regions: Region[]; onClose: () => void; onUpdate: () => void }) {
  const [form, setForm] = useState({ ...site });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const score = calculateCyberScore(form);
    const risk = riskLevelFromScore(score);
    await supabase.from('sites').update({ ...form, cyber_score: score, risk_level: risk }).eq('id', site.id);
    setSaving(false);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{site.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom">
              <input className="modal-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Type">
              <select className="modal-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SiteType })}>
                {Object.entries(SITE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Ministère">
              <input className="modal-input" value={form.ministere || ''} onChange={(e) => setForm({ ...form, ministere: e.target.value })} />
            </Field>
            <Field label="Organisme">
              <input className="modal-input" value={form.organisme || ''} onChange={(e) => setForm({ ...form, organisme: e.target.value })} />
            </Field>
            <Field label="Région">
              <select className="modal-input" value={form.region_id || ''} onChange={(e) => setForm({ ...form, region_id: e.target.value })}>
                <option value="">-</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Province">
              <input className="modal-input" value={form.province || ''} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </Field>
            <Field label="Commune">
              <input className="modal-input" value={form.commune || ''} onChange={(e) => setForm({ ...form, commune: e.target.value })} />
            </Field>
            <Field label="Latitude">
              <input type="number" step="0.0001" className="modal-input" value={form.latitude || ''} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} />
            </Field>
            <Field label="Longitude">
              <input type="number" step="0.0001" className="modal-input" value={form.longitude || ''} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} />
            </Field>
            <Field label="Plage IP">
              <input className="modal-input" value={form.ip_range || ''} onChange={(e) => setForm({ ...form, ip_range: e.target.value })} />
            </Field>
            <Field label="VLAN">
              <input className="modal-input" value={form.vlan || ''} onChange={(e) => setForm({ ...form, vlan: e.target.value })} />
            </Field>
            <Field label="Resp. IT">
              <input className="modal-input" value={form.resp_it_name || ''} onChange={(e) => setForm({ ...form, resp_it_name: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <input className="modal-input" value={form.resp_it_phone || ''} onChange={(e) => setForm({ ...form, resp_it_phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className="modal-input" value={form.resp_it_email || ''} onChange={(e) => setForm({ ...form, resp_it_email: e.target.value })} />
            </Field>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-2">Mesures de sécurité</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {([
                { key: 'has_firewall', label: 'Pare-feu' },
                { key: 'has_vpn', label: 'VPN' },
                { key: 'has_ad', label: 'Active Directory' },
                { key: 'has_backup', label: 'Sauvegardes' },
                { key: 'has_mfa', label: 'MFA' },
                { key: 'has_antivirus', label: 'Antivirus' },
                { key: 'has_edr', label: 'EDR' },
                { key: 'has_monitoring', label: 'Supervision' },
                { key: 'has_updates', label: 'Mises à jour' },
                { key: 'has_network_seg', label: 'Segmentation réseau' },
                { key: 'has_cis_compliance', label: 'CIS Benchmark' },
              ] as const).map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form as any)[m.key] || false}
                    onChange={(e) => setForm({ ...form, [m.key]: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Score cyber calculé</div>
              <div className="text-2xl font-bold" style={{ color: scoreColor(calculateCyberScore(form)) }}>
                {calculateCyberScore(form)}/100
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Niveau de risque</div>
              <div className="text-lg font-bold capitalize" style={{ color: RISK_COLORS[riskLevelFromScore(calculateCyberScore(form))] }}>
                {(() => { const r = riskLevelFromScore(calculateCyberScore(form)); return r === 'critical' ? 'Critique' : r === 'high' ? 'Élevé' : r === 'medium' ? 'Moyen' : 'Faible'; })()}
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSiteModal({ regions, onClose, onAdded }: { regions: Region[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState<any>({
    name: '', type: 'ministere', ministere: '', organisme: '', region_id: '', province: '', commune: '',
    latitude: 12.37, longitude: -1.52, address: '', resp_it_name: '', resp_it_phone: '', resp_it_email: '',
    ip_range: '', vlan: '', has_firewall: false, has_vpn: false, has_ad: false, has_backup: false,
    has_mfa: false, has_antivirus: false, has_edr: false, has_monitoring: false, has_updates: false,
    has_network_seg: false, has_cis_compliance: false, equipment_count: 0, vuln_count: 0, incident_count: 0,
    compliance_score: 0, status: 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const score = calculateCyberScore(form);
    const risk = riskLevelFromScore(score);
    await supabase.from('sites').insert({ ...form, cyber_score: score, risk_level: risk });
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Nouveau site</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom"><input className="modal-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Type">
            <select className="modal-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(SITE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Ministère"><input className="modal-input" value={form.ministere} onChange={(e) => setForm({ ...form, ministere: e.target.value })} /></Field>
          <Field label="Région">
            <select className="modal-input" value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })}>
              <option value="">-</option>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="Province"><input className="modal-input" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></Field>
          <Field label="Commune"><input className="modal-input" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} /></Field>
          <Field label="Latitude"><input type="number" step="0.0001" className="modal-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} /></Field>
          <Field label="Longitude"><input type="number" step="0.0001" className="modal-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} /></Field>
          <Field label="Plage IP"><input className="modal-input" value={form.ip_range} onChange={(e) => setForm({ ...form, ip_range: e.target.value })} /></Field>
          <Field label="Resp. IT"><input className="modal-input" value={form.resp_it_name} onChange={(e) => setForm({ ...form, resp_it_name: e.target.value })} /></Field>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Créer le site'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
