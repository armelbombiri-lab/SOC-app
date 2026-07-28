import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type UserRole =
  | 'super_admin'
  | 'admin_soc'
  | 'analyste_n1'
  | 'analyste_n2'
  | 'analyste_n3'
  | 'resp_it'
  | 'auditeur';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrateur',
  admin_soc: 'Administrateur SOC',
  analyste_n1: 'Analyste SOC N1',
  analyste_n2: 'Analyste SOC N2',
  analyste_n3: 'Analyste SOC N3',
  resp_it: 'Responsable IT Site',
  auditeur: 'Auditeur',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin_soc: ['sites', 'vulnerabilities', 'dashboards', 'reports', 'incidents', 'compliance', 'monitoring', 'connectors', 'threat_intel'],
  analyste_n1: ['alerts', 'vulnerabilities', 'dashboards', 'incidents:read'],
  analyste_n2: ['alerts', 'vulnerabilities', 'incidents', 'dashboards', 'threat_intel', 'monitoring'],
  analyste_n3: ['alerts', 'vulnerabilities', 'incidents', 'dashboards', 'threat_intel', 'monitoring', 'reports'],
  resp_it: ['sites:own', 'reports:own'],
  auditeur: ['dashboards:read', 'reports:read'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some((p) => permission === p || permission.startsWith(p + ':') || p.startsWith(permission + ':'));
}
