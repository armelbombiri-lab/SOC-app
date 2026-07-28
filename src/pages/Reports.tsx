import { useState, useEffect } from 'react';
import { FileText, Download, Globe, MapPin, Building2, Bug, Shield, FileBarChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Site, Region } from '@/lib/types';

export function Reports() {
  const [sites, setSites] = useState<Site[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [sRes, rRes] = await Promise.all([supabase.from('sites').select('*'), supabase.from('regions').select('*')]);
      setSites(sRes.data || []);
      setRegions(rRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const reportTypes = [
    { id: 'national', label: 'Rapport National', icon: Globe, desc: 'Vue d\'ensemble nationale' },
    { id: 'regional', label: 'Rapport Régional', icon: MapPin, desc: 'Par région administrative' },
    { id: 'site', label: 'Rapport par Site', icon: Building2, desc: 'Détail d\'un site' },
    { id: 'vulnerabilities', label: 'Rapport Vulnérabilités', icon: Bug, desc: 'Synthèse des CVE' },
    { id: 'compliance', label: 'Rapport Conformité', icon: Shield, desc: 'ISO, CIS, NIST' },
    { id: 'incidents', label: 'Rapport Incidents', icon: FileBarChart, desc: 'Historique des incidents' },
    { id: 'executive', label: 'Rapport Exécutif', icon: FileText, desc: 'Synthèse pour direction' },
  ];

  const generateReport = (type: string) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const data = buildReportHTML(type, sites, regions);
    win.document.write(data);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Rapports</h1>
        <p className="text-sm text-slate-400">Génération de rapports PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => generateReport(r.id)} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left hover:border-emerald-500/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="font-semibold text-white text-sm mb-1">{r.label}</div>
              <div className="text-xs text-slate-400 mb-3">{r.desc}</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Download className="w-3.5 h-3.5" /> Générer le PDF
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildReportHTML(type: string, sites: Site[], regions: Region[]): string {
  const avgScore = sites.length > 0 ? Math.round(sites.reduce((s, x) => s + x.cyber_score, 0) / sites.length) : 0;
  const totalEquip = sites.reduce((s, x) => s + x.equipment_count, 0);
  const totalVuln = sites.reduce((s, x) => s + x.vuln_count, 0);
  const totalInc = sites.reduce((s, x) => s + x.incident_count, 0);
  const avgComp = sites.length > 0 ? Math.round(sites.reduce((s, x) => s + x.compliance_score, 0) / sites.length) : 0;

  const title = type === 'national' ? 'Rapport National' : type === 'executive' ? 'Rapport Exécutif' : type === 'regional' ? 'Rapport Régional' : type === 'site' ? 'Rapport par Site' : type === 'vulnerabilities' ? 'Rapport Vulnérabilités' : type === 'compliance' ? 'Rapport Conformité' : 'Rapport Incidents';

  let body = '';
  if (type === 'national' || type === 'executive') {
    body = `
      <h2>Indicateurs Nationaux</h2>
      <table>
        <tr><td>Sites supervisés</td><td>${sites.length}</td></tr>
        <tr><td>Sites critiques</td><td>${sites.filter(s => s.risk_level === 'critical').length}</td></tr>
        <tr><td>Score cyber national</td><td>${avgScore}/100</td></tr>
        <tr><td>Équipements supervisés</td><td>${totalEquip.toLocaleString()}</td></tr>
        <tr><td>Vulnérabilités</td><td>${totalVuln.toLocaleString()}</td></tr>
        <tr><td>Incidents</td><td>${totalInc}</td></tr>
        <tr><td>Conformité globale</td><td>${avgComp}%</td></tr>
      </table>
      <h2>Sites par niveau de risque</h2>
      <table>
        <tr><th>Site</th><th>Type</th><th>Région</th><th>Score</th><th>Risque</th><th>Équip.</th><th>Vuln.</th></tr>
        ${sites.map(s => `<tr><td>${s.name}</td><td>${s.type}</td><td>${regions.find(r => r.id === s.region_id)?.name || '-'}</td><td>${s.cyber_score}</td><td>${s.risk_level}</td><td>${s.equipment_count}</td><td>${s.vuln_count}</td></tr>`).join('')}
      </table>
    `;
  } else if (type === 'regional') {
    body = `<h2>Synthèse par région</h2><table><tr><th>Région</th><th>Sites</th><th>Score moyen</th><th>Équipements</th><th>Vulnérabilités</th></tr>
      ${regions.map(r => {
        const rs = sites.filter(s => s.region_id === r.id);
        const sc = rs.length > 0 ? Math.round(rs.reduce((a, b) => a + b.cyber_score, 0) / rs.length) : 0;
        return `<tr><td>${r.name}</td><td>${rs.length}</td><td>${sc}</td><td>${rs.reduce((a, b) => a + b.equipment_count, 0)}</td><td>${rs.reduce((a, b) => a + b.vuln_count, 0)}</td></tr>`;
      }).join('')}</table>`;
  } else if (type === 'site') {
    body = `<h2>Liste des sites</h2><table><tr><th>Nom</th><th>Ministère</th><th>Commune</th><th>Score</th><th>Risque</th><th>Resp. IT</th><th>Téléphone</th></tr>
      ${sites.map(s => `<tr><td>${s.name}</td><td>${s.ministere || '-'}</td><td>${s.commune || '-'}</td><td>${s.cyber_score}</td><td>${s.risk_level}</td><td>${s.resp_it_name || '-'}</td><td>${s.resp_it_phone || '-'}</td></tr>`).join('')}</table>`;
  } else if (type === 'vulnerabilities') {
    body = `<h2>Synthèse vulnérabilités</h2><table><tr><th>Site</th><th>Vulnérabilités</th><th>Score cyber</th><th>Niveau risque</th></tr>
      ${sites.map(s => `<tr><td>${s.name}</td><td>${s.vuln_count}</td><td>${s.cyber_score}</td><td>${s.risk_level}</td></tr>`).join('')}</table>`;
  } else if (type === 'compliance') {
    body = `<h2>Synthèse conformité</h2><table><tr><th>Site</th><th>Score conformité</th><th>Score cyber</th><th>Mesures actives</th></tr>
      ${sites.map(s => {
        const measures = [s.has_firewall, s.has_vpn, s.has_ad, s.has_backup, s.has_mfa, s.has_antivirus, s.has_edr, s.has_monitoring, s.has_updates, s.has_network_seg, s.has_cis_compliance].filter(Boolean).length;
        return `<tr><td>${s.name}</td><td>${s.compliance_score}%</td><td>${s.cyber_score}</td><td>${measures}/11</td></tr>`;
      }).join('')}</table>`;
  } else {
    body = `<h2>Synthèse incidents</h2><table><tr><th>Site</th><th>Incidents</th><th>Score cyber</th><th>Niveau risque</th></tr>
      ${sites.map(s => `<tr><td>${s.name}</td><td>${s.incident_count}</td><td>${s.cyber_score}</td><td>${s.risk_level}</td></tr>`).join('')}</table>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 40px; }
      h1 { color: #0f766e; border-bottom: 3px solid #0f766e; padding-bottom: 10px; }
      h2 { color: #334155; margin-top: 30px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
      th { background: #0f766e; color: white; padding: 8px; text-align: left; }
      td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .logo { font-size: 20px; font-weight: bold; color: #0f766e; }
      .date { color: #64748b; font-size: 12px; }
      @media print { body { margin: 15px; } }
    </style></head><body>
    <div class="header"><div class="logo">Faso Nifri - National SOC Monitoring</div><div class="date">${new Date().toLocaleString('fr-FR')}</div></div>
    <h1>${title}</h1>${body}
    <script>window.onload = () => window.print();</script>
    </body></html>`;
}
