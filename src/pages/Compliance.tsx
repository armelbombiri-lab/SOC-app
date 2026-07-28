import { useState, useEffect } from 'react';
import { FileCheck, Shield } from 'lucide-react';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import type { ComplianceCheck, Site } from '@/lib/types';
import { FRAMEWORK_LABELS } from '@/lib/types';

export function Compliance() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [framework, setFramework] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const [cRes, sRes] = await Promise.all([supabase.from('compliance_checks').select('*'), supabase.from('sites').select('*')]);
      setChecks(cRes.data || []);
      setSites(sRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const filtered = framework === 'all' ? checks : checks.filter((c) => c.framework === framework);

  const frameworkStats = Object.entries(FRAMEWORK_LABELS).map(([key, label]) => {
    const fwChecks = checks.filter((c) => c.framework === key);
    const compliant = fwChecks.filter((c) => c.status === 'compliant').length;
    const pct = fwChecks.length > 0 ? Math.round((compliant / fwChecks.length) * 100) : 0;
    return { key, label, pct, total: fwChecks.length };
  });

  const statusData = [
    { name: 'Conforme', value: checks.filter((c) => c.status === 'compliant').length, color: '#22c55e' },
    { name: 'Non conforme', value: checks.filter((c) => c.status === 'non_compliant').length, color: '#ef4444' },
    { name: 'Partiel', value: checks.filter((c) => c.status === 'partial').length, color: '#eab308' },
    { name: 'N/A', value: checks.filter((c) => c.status === 'na').length, color: '#6b7280' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Conformité</h1>
        <p className="text-sm text-slate-400">ISO 27001 · CIS · NIST · PCI DSS · ANSSI · OWASP</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {frameworkStats.map((f) => (
          <div key={f.key} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-1 truncate">{f.label}</div>
            <div className={`text-2xl font-bold ${f.pct >= 75 ? 'text-emerald-400' : f.pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{f.pct}%</div>
            <div className="text-[10px] text-slate-500">{f.total} contrôles</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Statut global des contrôles</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Conformité par framework</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={frameworkStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="pct" name="Conformité %" radius={[8, 8, 0, 0]}>
                {frameworkStats.map((entry, i) => <Cell key={i} fill={entry.pct >= 75 ? '#22c55e' : entry.pct >= 50 ? '#eab308' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFramework('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${framework === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Tous</button>
        {Object.entries(FRAMEWORK_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFramework(k)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${framework === k ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">Framework</th>
              <th className="px-4 py-3 font-medium">Contrôle</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((c) => (
              <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-white">{FRAMEWORK_LABELS[c.framework]}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-400">{c.control_id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{c.control_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md ${
                    c.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'non_compliant' ? 'bg-red-500/20 text-red-400' :
                    c.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{c.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
