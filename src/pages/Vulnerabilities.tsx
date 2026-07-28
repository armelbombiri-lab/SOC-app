import { useState, useEffect } from 'react';
import { Bug, Search, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Vulnerability } from '@/lib/types';
import { SEVERITY_COLORS } from '@/lib/types';

export function Vulnerabilities() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterKev, setFilterKev] = useState(false);
  const [selected, setSelected] = useState<Vulnerability | null>(null);

  useEffect(() => {
    supabase.from('vulnerabilities').select('*').then(({ data }) => {
      setVulns(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = vulns.filter((v) => {
    if (search && !v.cve_id.toLowerCase().includes(search.toLowerCase()) && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSeverity !== 'all' && v.severity !== filterSeverity) return false;
    if (filterKev && !v.is_kev) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const stats = {
    critical: vulns.filter((v) => v.severity === 'critical').length,
    high: vulns.filter((v) => v.severity === 'high').length,
    kev: vulns.filter((v) => v.is_kev).length,
    avgEpss: vulns.length > 0 ? Math.round((vulns.reduce((s, v) => s + (v.epss_score || 0), 0) / vulns.length) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Vulnérabilités</h1>
        <p className="text-sm text-slate-400">Base CVE / CVSS / MITRE ATT&CK / KEV / EPSS</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon={AlertTriangle} label="Critiques" value={stats.critical} color="red" />
        <StatBox icon={Bug} label="Élevées" value={stats.high} color="orange" />
        <StatBox icon={Shield} label="KEV Catalog" value={stats.kev} color="yellow" />
        <StatBox icon={AlertTriangle} label="EPSS moyen" value={`${stats.avgEpss}%`} color="blue" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Rechercher CVE..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500" />
        </div>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Toutes sévérités</option>
          <option value="critical">Critique</option>
          <option value="high">Élevé</option>
          <option value="medium">Moyen</option>
          <option value="low">Faible</option>
        </select>
        <label className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={filterKev} onChange={(e) => setFilterKev(e.target.checked)} className="accent-emerald-500" />
          KEV uniquement
        </label>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">CVE</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">CVSS</th>
              <th className="px-4 py-3 font-medium">Sévérité</th>
              <th className="px-4 py-3 font-medium">EPSS</th>
              <th className="px-4 py-3 font-medium">KEV</th>
              <th className="px-4 py-3 font-medium">MITRE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} onClick={() => setSelected(v)} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-emerald-400">{v.cve_id}</td>
                <td className="px-4 py-3 text-sm text-white max-w-xs truncate">{v.title}</td>
                <td className="px-4 py-3 text-sm font-bold text-white">{v.cvss_score}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-md capitalize" style={{ background: SEVERITY_COLORS[v.severity] + '20', color: SEVERITY_COLORS[v.severity] }}>
                    {v.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{v.epss_score ? `${(v.epss_score * 100).toFixed(1)}%` : '-'}</td>
                <td className="px-4 py-3">{v.is_kev ? <span className="text-xs px-2 py-0.5 rounded-md bg-red-500/20 text-red-400">KEV</span> : <span className="text-slate-600">-</span>}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-400">{v.mitre_technique || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-emerald-400 text-sm">{selected.cve_id}</div>
                <h2 className="text-lg font-bold text-white mt-1">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-slate-300 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="CVSS Score" value={selected.cvss_score.toString()} />
              <Info label="Sévérité" value={selected.severity} />
              <Info label="CWE" value={selected.cwe || '-'} />
              <Info label="CPE" value={selected.cpe || '-'} />
              <Info label="EPSS" value={selected.epss_score ? `${(selected.epss_score * 100).toFixed(2)}%` : '-'} />
              <Info label="MITRE" value={selected.mitre_technique || '-'} />
              <Info label="KEV" value={selected.is_kev ? 'Oui' : 'Non'} />
              <Info label="Publié le" value={selected.published_date || '-'} />
            </div>
            <div className="mt-4 text-xs text-slate-400 font-mono break-all bg-slate-800/50 p-3 rounded-lg">{selected.cvss_vector}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof Bug; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = { red: 'text-red-400 bg-red-500/10', orange: 'text-orange-400 bg-orange-500/10', yellow: 'text-yellow-400 bg-yellow-500/10', blue: 'text-blue-400 bg-blue-500/10' };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}><Icon className="w-4 h-4" /></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-xs text-slate-400">{label}</div><div className="text-sm text-white">{value}</div></div>;
}
