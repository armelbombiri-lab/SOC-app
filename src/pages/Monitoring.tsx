import { useState, useEffect } from 'react';
import { Activity, Cpu, Server, Network, HardDrive, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabase';
import type { Equipment, Site } from '@/lib/types';

export function Monitoring() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [eRes, sRes] = await Promise.all([supabase.from('equipments').select('*'), supabase.from('sites').select('*')]);
      setEquipments(eRes.data || []);
      setSites(sRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const online = equipments.filter((e) => e.status === 'online').length;
  const offline = equipments.filter((e) => e.status === 'offline').length;
  const degraded = equipments.filter((e) => e.status === 'degraded').length;
  const avgCpu = equipments.length > 0 ? Math.round(equipments.reduce((s, e) => s + (e.cpu_usage || 0), 0) / equipments.length) : 0;
  const avgRam = equipments.length > 0 ? Math.round(equipments.reduce((s, e) => s + (e.ram_usage || 0), 0) / equipments.length) : 0;

  const mockMetrics = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}h`,
    cpu: 30 + Math.random() * 50,
    ram: 40 + Math.random() * 40,
    network: Math.random() * 100,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Monitoring temps réel</h1>
        <p className="text-sm text-slate-400">État des équipements supervisés</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Server} label="En ligne" value={online} color="emerald" />
        <Stat icon={Server} label="Hors ligne" value={offline} color="red" />
        <Stat icon={Activity} label="Dégradé" value={degraded} color="yellow" />
        <Stat icon={Cpu} label="CPU moyen" value={`${avgCpu}%`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-400" /> CPU & RAM (24h)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockMetrics}>
              <defs>
                <linearGradient id="cpuG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                <linearGradient id="ramG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#3b82f6" fill="url(#cpuG)" strokeWidth={2} />
              <Area type="monotone" dataKey="ram" name="RAM %" stroke="#10b981" fill="url(#ramG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-400" /> Trafic réseau (24h)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={mockMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="network" name="Bande passante (Mbps)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Équipements supervisés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Équipement</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">OS</th>
                <th className="px-4 py-3 font-medium">CPU</th>
                <th className="px-4 py-3 font-medium">RAM</th>
                <th className="px-4 py-3 font-medium">Disque</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {equipments.slice(0, 50).map((e) => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-sm text-white font-mono">{e.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 capitalize">{e.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{sites.find((s) => s.id === e.site_id)?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-400">{e.ip_address || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{e.os} {e.os_version}</td>
                  <td className="px-4 py-3"><UsageBar value={e.cpu_usage} /></td>
                  <td className="px-4 py-3"><UsageBar value={e.ram_usage} /></td>
                  <td className="px-4 py-3"><UsageBar value={e.disk_usage} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      e.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                      e.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Cpu; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = { emerald: 'text-emerald-400 bg-emerald-500/10', red: 'text-red-400 bg-red-500/10', yellow: 'text-yellow-400 bg-yellow-500/10', blue: 'text-blue-400 bg-blue-500/10' };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}><Icon className="w-4 h-4" /></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function UsageBar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-600 text-sm">-</span>;
  const color = value > 80 ? '#ef4444' : value > 60 ? '#eab308' : '#22c55e';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400">{value.toFixed(0)}%</span>
    </div>
  );
}
