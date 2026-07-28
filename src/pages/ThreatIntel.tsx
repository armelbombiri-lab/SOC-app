import { useState, useEffect } from 'react';
import { AlertTriangle, Bug, Globe, Hash, Link, FileWarning } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ThreatIntel } from '@/lib/types';

export function ThreatIntel() {
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    supabase.from('threat_intel').select('*').then(({ data }) => {
      setThreats(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const filtered = filterType === 'all' ? threats : threats.filter((t) => t.type === filterType);

  const typeIcons: Record<string, typeof Globe> = { ip: Globe, domain: Link, hash: Hash, url: Link, email: FileWarning, cve: Bug, ioc: AlertTriangle };
  const tlpColors: Record<string, string> = { white: '#ffffff', green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Threat Intelligence</h1>
        <p className="text-sm text-slate-400">MITRE ATT&CK · CISA KEV · IOC · IP/Domaines malveillants</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="IOC total" value={threats.length} color="red" />
        <Stat label="IP malveillantes" value={threats.filter((t) => t.type === 'ip').length} color="orange" />
        <Stat label="Domaines" value={threats.filter((t) => t.type === 'domain').length} color="yellow" />
        <Stat label="Hashes" value={threats.filter((t) => t.type === 'hash').length} color="blue" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filterType === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Tous</button>
        {['ip', 'domain', 'hash', 'url', 'ioc'].map((t) => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${filterType === t ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((t) => {
          const Icon = typeIcons[t.type] || AlertTriangle;
          return (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono truncate">{t.value}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{t.type}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{t.description}</div>
                <div className="text-xs text-slate-600 mt-0.5">{t.source} · {t.threat_actor || 'Unknown'} · {t.mitre_technique || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Confiance</div>
                <div className="text-sm font-bold text-white">{t.confidence}%</div>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ background: tlpColors[t.tlp] }} title={`TLP:${t.tlp.toUpperCase()}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = { red: 'text-red-400', orange: 'text-orange-400', yellow: 'text-yellow-400', blue: 'text-blue-400' };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
