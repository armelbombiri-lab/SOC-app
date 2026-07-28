import { useState, useEffect } from 'react';
import {
  Building2, Shield, AlertTriangle, Bug, Activity, FileCheck, TrendingUp,
  Server, Upload, X, Radar, CheckCircle,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Site, Incident, Alert as AlertType, Vulnerability } from '@/lib/types';
import { SEVERITY_COLORS, RISK_COLORS } from '@/lib/types';
import { scoreColor } from '@/lib/utils';

export function Dashboard() {
  const { isSuperAdmin } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [s, i, a, v] = await Promise.all([
        supabase.from('sites').select('*'),
        supabase.from('incidents').select('*'),
        supabase.from('alerts').select('*'),
        supabase.from('vulnerabilities').select('*'),
      ]);
      setSites(s.data || []);
      setIncidents(i.data || []);
      setAlerts(a.data || []);
      setVulns(v.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const totalSites = sites.length;
  const criticalSites = sites.filter(s => s.risk_level === 'critical').length;
  const totalEquip = sites.reduce((sum, s) => sum + (s.equipment_count || 0), 0);
  const totalVulns = sites.reduce((sum, s) => sum + (s.vuln_count || 0), 0);
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const criticalVulns = vulns.filter(v => v.severity === 'critical').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;
  const avgScore = sites.length > 0 ? Math.round(sites.reduce((sum, s) => sum + s.cyber_score, 0) / sites.length) : 0;
  const avgCompliance = sites.length > 0 ? Math.round(sites.reduce((sum, s) => sum + s.compliance_score, 0) / sites.length) : 0;

  const riskDistribution = (['critical', 'high', 'medium', 'low'] as const).map(level => ({
    name: level === 'critical' ? 'Critique' : level === 'high' ? 'Haut' : level === 'medium' ? 'Moyen' : 'Faible',
    value: sites.filter(s => s.risk_level === level).length,
    color: RISK_COLORS[level],
  }));

  const trend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split('T')[0];
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
      incidents: incidents.filter(inc => inc.created_at.startsWith(dayStr)).length,
      alerts: alerts.filter(a => a.created_at.startsWith(dayStr)).length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm text-slate-400">Vue d'ensemble - Faso Nifri National SOC</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            <Upload className="w-4 h-4" /> Importer Nmap / GLPI
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Building2} label="Sites supervises" value={totalSites} sub={`${criticalSites} critiques`} color="emerald" />
        <KPI icon={Shield} label="Score cyber national" value={`${avgScore}`} sub="sur 100" color={avgScore >= 60 ? 'emerald' : avgScore >= 40 ? 'yellow' : 'red'} />
        <KPI icon={Server} label="Equipements" value={totalEquip.toLocaleString()} sub="supervises" color="blue" />
        <KPI icon={FileCheck} label="Conformite" value={`${avgCompliance}%`} sub="global" color="blue" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Bug} label="Vulnerabilites" value={totalVulns.toLocaleString()} sub={`${criticalVulns} critiques`} color="orange" />
        <KPI icon={AlertTriangle} label="Incidents ouverts" value={openIncidents} sub="a traiter" color="red" />
        <KPI icon={Activity} label="Nouvelles alertes" value={newAlerts} sub="temps reel" color="yellow" />
        <KPI icon={TrendingUp} label="Tendance" value="+" sub="amelioration" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Score cyber national</h3>
          <div className="flex items-center justify-center h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: 'Score', value: avgScore, fill: scoreColor(avgScore) }]} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white" style={{ fontSize: '36px', fontWeight: 'bold' }}>{avgScore}</text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Distribution des risques</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                {riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Conformite globale</h3>
          <div className="flex items-center justify-center h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: 'Score', value: avgCompliance, fill: '#3b82f6' }]} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white" style={{ fontSize: '36px', fontWeight: 'bold' }}>{avgCompliance}%</text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Activite - 7 derniers jours</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              <linearGradient id="alertG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#ef4444" fill="url(#incG)" strokeWidth={2} />
            <Area type="monotone" dataKey="alerts" name="Alertes" stroke="#f59e0b" fill="url(#alertG)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Alertes recentes</h3>
          <div className="space-y-2">
            {alerts.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[a.severity] }} />
                <div className="flex-1 min-w-0"><div className="text-sm text-white truncate">{a.title}</div><div className="text-xs text-slate-500">{a.source}</div></div>
                <span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Incidents recents</h3>
          <div className="space-y-2">
            {incidents.slice(0, 6).map(inc => (
              <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[inc.severity] }} />
                <div className="flex-1 min-w-0"><div className="text-sm text-white truncate">{inc.title}</div><div className="text-xs text-slate-500 capitalize">{inc.status} - {inc.category}</div></div>
                <span className="text-xs text-slate-500">{new Date(inc.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, color }: { icon: typeof Building2; label: string; value: string | number; sub: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10', red: 'text-red-400 bg-red-500/10',
    blue: 'text-blue-400 bg-blue-500/10', orange: 'text-orange-400 bg-orange-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}><Icon className="w-4 h-4" /></div>
        <span className="text-xs text-slate-500">{sub}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [importType, setImportType] = useState<'nmap' | 'glpi'>('nmap');
  const [file, setFile] = useState<File | null>(null);
  const [pastedData, setPastedData] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; details: string[] } | null>(null);

  const handleImport = async () => {
    setImporting(true);
    let data = pastedData;
    if (file) {
      data = await file.text();
    }
    if (!data.trim()) {
      setImporting(false);
      return;
    }
    if (importType === 'nmap') {
      setResult(parseNmapXML(data));
    } else {
      setResult(parseGLPICSV(data));
    }
    setImporting(false);
  };

  function parseNmapXML(xml: string): { success: number; errors: number; details: string[] } {
    const details: string[] = [];
    let success = 0, errors = 0;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const hosts = doc.querySelectorAll('host');
      hosts.forEach((host) => {
        const addr = host.getAttribute('addr');
        const status = host.querySelector('status')?.getAttribute('state');
        const osEl = host.querySelector('os > osmatch');
        const osName = osEl?.getAttribute('name') || 'Unknown';
        const ports = host.querySelectorAll('port');
        const openPorts: string[] = [];
        ports.forEach((p) => {
          const portId = p.getAttribute('portid');
          const state = p.querySelector('state')?.getAttribute('state');
          if (state === 'open' && portId) openPorts.push(portId);
        });
        if (addr) {
          success++;
          details.push(`${addr} (${status || 'unknown'}) - OS: ${osName} - Ports ouverts: ${openPorts.join(', ') || 'aucun'}`);
        }
      });
    } catch {
      errors = 1;
      details.push('Erreur de parsing XML');
    }
    return { success, errors, details };
  }

  function parseGLPICSV(csv: string): { success: number; errors: number; details: string[] } {
    const details: string[] = [];
    let success = 0, errors = 0;
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return { success: 0, errors: 1, details: ['Fichier CSV vide ou invalide'] };
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const getName = (key: string) => cols[headers.indexOf(key)] || '-';
      const name = getName('name') !== '-' ? getName('name') : getName('nom');
      const ip = getName('ip') !== '-' ? getName('ip') : getName('ipaddress');
      const os = getName('os') !== '-' ? getName('os') : getName('operatingsystem');
      if (name && name !== '-') {
        success++;
        details.push(`${name} - IP: ${ip} - OS: ${os}`);
      } else {
        errors++;
      }
    }
    return { success, errors, details };
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Importer des donnees</h2>
            <p className="text-sm text-slate-400">Import Nmap (XML) ou GLPI (CSV)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setImportType('nmap')} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${importType === 'nmap' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <Radar className="w-5 h-5" /> Nmap (XML)
          </button>
          <button onClick={() => setImportType('glpi')} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${importType === 'glpi' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <Server className="w-5 h-5" /> GLPI (CSV)
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Fichier {importType === 'nmap' ? 'XML' : 'CSV'}</label>
            <input
              type="file"
              accept={importType === 'nmap' ? '.xml' : '.csv'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:font-medium file:cursor-pointer hover:file:bg-emerald-600"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Ou collez les donnees directement</label>
            <textarea
              rows={6}
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              placeholder={importType === 'nmap' ? '<nmaprun>...</nmaprun>' : 'name,ip,os / SRV-01,192.168.1.1,Windows Server'}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button onClick={handleImport} disabled={importing || (!file && !pastedData)} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">
            {importing ? 'Import en cours...' : 'Importer'}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-emerald-400"><CheckCircle className="w-4 h-4" /> {result.success} importes</div>
              {result.errors > 0 && <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /> {result.errors} erreurs</div>}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {result.details.map((d, i) => (
                <div key={i} className="text-xs text-slate-400 font-mono">{d}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
