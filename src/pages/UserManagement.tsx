import { useState, useEffect } from 'react';
import { Users, Plus, X, Mail, Phone, Shield, Lock, Trash2, AlertCircle } from 'lucide-react';
import { supabase, type UserRole, ROLE_LABELS } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Site } from '@/lib/types';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  site_id: string | null;
  phone: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export function UserManagement() {
  const { user, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const fetch = async () => {
    const [uRes, sRes] = await Promise.all([supabase.from('profiles').select('*'), supabase.from('sites').select('*')]);
    setUsers(uRes.data || []);
    setSites(sRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lock className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-1">Accès restreint</h2>
        <p className="text-sm text-slate-400">Seul le Super Administrateur peut gérer les utilisateurs et les rôles.</p>
      </div>
    );
  }

  const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-500/20 text-red-400',
    admin_soc: 'bg-emerald-500/20 text-emerald-400',
    analyste_n1: 'bg-blue-500/20 text-blue-400',
    analyste_n2: 'bg-blue-500/20 text-blue-400',
    analyste_n3: 'bg-purple-500/20 text-purple-400',
    resp_it: 'bg-yellow-500/20 text-yellow-400',
    auditeur: 'bg-slate-500/20 text-slate-400',
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('profiles').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-sm text-slate-400">{filtered.length} utilisateurs · Gestion RBAC (Super Admin uniquement)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un utilisateur
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterRole('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filterRole === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Tous</button>
        {Object.entries(ROLE_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilterRole(k)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filterRole === k ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white">{u.full_name || u.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={async (e) => {
                      await supabase.from('profiles').update({ role: e.target.value as UserRole }).eq('id', u.id);
                      fetch();
                    }}
                    className={`text-xs px-2 py-1 rounded-md border-0 cursor-pointer ${roleColors[u.role]}`}
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-slate-800 text-white">{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{sites.find(s => s.id === u.site_id)?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{u.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md ${u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.id !== user?.id && (
                    <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddUserModal sites={sites} onClose={() => setShowAdd(false)} onAdded={fetch} />}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-400" /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Supprimer l'utilisateur</h2>
                <p className="text-xs text-slate-400">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-4">Voulez-vous vraiment supprimer <span className="font-semibold text-white">{deleteTarget.full_name || deleteTarget.email}</span> ?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddUserModal({ sites, onClose, onAdded }: { sites: Site[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'analyste_n1' as UserRole, site_id: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (authError) { setError(authError.message); setSaving(false); return; }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, email: form.email, full_name: form.full_name, role: form.role, site_id: form.site_id || null, phone: form.phone, is_active: true });
    }
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nouvel utilisateur</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        <div className="space-y-3">
          <div><label className="text-xs text-slate-400 mb-1 block">Nom complet</label><input className="modal-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Email</label><input type="email" className="modal-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Mot de passe</label><input type="password" className="modal-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Rôle</label>
            <select className="modal-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Site (optionnel)</label>
            <select className="modal-input" value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value })}>
              <option value="">-</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Téléphone</label><input className="modal-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">{saving ? 'Création...' : 'Créer l\'utilisateur'}</button>
        </div>
      </div>
    </div>
  );
}
