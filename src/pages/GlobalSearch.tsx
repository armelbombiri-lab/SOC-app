import { useState, useEffect } from 'react';
import { Search, Building2, Bug, Globe, Server, MapPin, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Site, Vulnerability, Region } from '@/lib/types';
import type { PageId } from '@/App';

interface GlobalSearchProps {
  onNavigate: (page: PageId) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('sites').select('*'),
      supabase.from('vulnerabilities').select('*'),
      supabase.from('regions').select('*'),
      supabase.from('equipments').select('*'),
    ]).then(([s, v, r, e]) => {
      setSites(s.data || []);
      setVulns(v.data || []);
      setRegions(r.data || []);
      setEquipments(e.data || []);
    });
  }, []);

  const q = query.toLowerCase().trim();
  const matchSites = q ? sites.filter((s) => s.name.toLowerCase().includes(q) || s.ministere?.toLowerCase().includes(q) || s.commune?.toLowerCase().includes(q) || s.ip_range?.includes(q)) : [];
  const matchVulns = q ? vulns.filter((v) => v.cve_id.toLowerCase().includes(q) || v.title.toLowerCase().includes(q)) : [];
  const matchRegions = q ? regions.filter((r) => r.name.toLowerCase().includes(q)) : [];
  const matchEquip = q ? equipments.filter((e) => e.name?.toLowerCase().includes(q) || e.ip_address?.includes(q)) : [];

  const total = matchSites.length + matchVulns.length + matchRegions.length + matchEquip.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Recherche globale</h1>
        <p className="text-sm text-slate-400">Sites, CVE, IP, régions, équipements...</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher un site, une CVE, une IP, une région..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(true); }}
          autoFocus
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-11 pr-3 py-3 text-base text-white placeholder-slate-500"
        />
      </div>

      {query && (
        <div className="text-sm text-slate-400">{total} résultat(s) trouvé(s)</div>
      )}

      {matchSites.length > 0 && (
        <Section title="Sites" icon={Building2} count={matchSites.length}>
          {matchSites.slice(0, 10).map((s) => (
            <div key={s.id} onClick={() => onNavigate('sites')} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer">
              <Building2 className="w-4 h-4 text-slate-500" />
              <div className="flex-1"><div className="text-sm text-white">{s.name}</div><div className="text-xs text-slate-500">{s.commune}, {s.province}</div></div>
              <div className="text-xs text-slate-400">Score: {s.cyber_score}</div>
            </div>
          ))}
        </Section>
      )}

      {matchVulns.length > 0 && (
        <Section title="Vulnérabilités" icon={Bug} count={matchVulns.length}>
          {matchVulns.slice(0, 10).map((v) => (
            <div key={v.id} onClick={() => onNavigate('vulnerabilities')} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer">
              <Bug className="w-4 h-4 text-slate-500" />
              <div className="flex-1"><div className="text-sm font-mono text-emerald-400">{v.cve_id}</div><div className="text-xs text-slate-500">{v.title}</div></div>
              <div className="text-xs text-slate-400">CVSS: {v.cvss_score}</div>
            </div>
          ))}
        </Section>
      )}

      {matchRegions.length > 0 && (
        <Section title="Régions" icon={MapPin} count={matchRegions.length}>
          {matchRegions.map((r) => (
            <div key={r.id} onClick={() => onNavigate('cartography')} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div className="flex-1"><div className="text-sm text-white">{r.name}</div><div className="text-xs text-slate-500">Chef-lieu: {r.chef_lieu}</div></div>
            </div>
          ))}
        </Section>
      )}

      {matchEquip.length > 0 && (
        <Section title="Équipements" icon={Server} count={matchEquip.length}>
          {matchEquip.slice(0, 10).map((e) => (
            <div key={e.id} onClick={() => onNavigate('monitoring')} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer">
              <Server className="w-4 h-4 text-slate-500" />
              <div className="flex-1"><div className="text-sm font-mono text-white">{e.name}</div><div className="text-xs text-slate-500">{e.ip_address} · {e.os}</div></div>
              <div className="text-xs text-slate-400">{e.status}</div>
            </div>
          ))}
        </Section>
      )}

      {query && total === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
          Aucun résultat pour "{query}"
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, count, children }: { title: string; icon: typeof Building2; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className="w-4 h-4 text-emerald-400" />
        {title}
        <span className="text-xs text-slate-500 font-normal">({count})</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
