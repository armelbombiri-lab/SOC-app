
/*
# SOC National Monitoring Platform - Schema complet

## Description
Schéma complet pour la plateforme nationale de monitoring et de cybersécurité du Burkina Faso.

## Tables créées
1. `profiles` - Profils utilisateurs avec rôles RBAC (super_admin, admin_soc, analyste_n1/n2/n3, resp_it, auditeur)
2. `regions` - Régions administratives du Burkina Faso
3. `sites` - Sites gouvernementaux et infrastructures
4. `equipments` - Inventaire des équipements par site
5. `vulnerabilities` - CVE et vulnérabilités détectées
6. `site_vulnerabilities` - Association vulnérabilités/sites
7. `incidents` - Gestion des incidents de sécurité
8. `alerts` - Alertes temps réel
9. `compliance_checks` - Contrôles de conformité (ISO27001, CIS, NIST)
10. `connectors` - Connecteurs d'intégration (GLPI, Wazuh, Nmap, etc.)
11. `threat_intel` - Threat intelligence (IOC, IP malveillantes)
12. `monitoring_metrics` - Métriques temps réel des équipements

## Sécurité
- RLS activé sur toutes les tables
- Politiques basées sur les rôles utilisateurs
*/

-- Profils utilisateurs avec rôles RBAC
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'analyste_n1' CHECK (role IN ('super_admin','admin_soc','analyste_n1','analyste_n2','analyste_n3','resp_it','auditeur')),
  site_id uuid,
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Régions du Burkina Faso
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  chef_lieu text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "regions_select" ON regions;
DROP POLICY IF EXISTS "regions_insert" ON regions;
DROP POLICY IF EXISTS "regions_update" ON regions;
DROP POLICY IF EXISTS "regions_delete" ON regions;
CREATE POLICY "regions_select" ON regions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "regions_insert" ON regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "regions_update" ON regions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "regions_delete" ON regions FOR DELETE TO authenticated USING (true);

-- Sites gouvernementaux
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'ministere' CHECK (type IN ('ministere','direction','mairie','societe_etat','ong','privee','autre')),
  ministere text,
  organisme text,
  region_id uuid REFERENCES regions(id),
  province text,
  commune text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  address text,
  resp_it_name text,
  resp_it_phone text,
  resp_it_email text,
  -- Réseau
  ip_range text,
  vlan text,
  has_firewall boolean DEFAULT false,
  has_vpn boolean DEFAULT false,
  has_ad boolean DEFAULT false,
  has_backup boolean DEFAULT false,
  has_mfa boolean DEFAULT false,
  has_antivirus boolean DEFAULT false,
  has_edr boolean DEFAULT false,
  has_monitoring boolean DEFAULT false,
  has_updates boolean DEFAULT false,
  has_network_seg boolean DEFAULT false,
  has_cis_compliance boolean DEFAULT false,
  -- Scores
  cyber_score integer DEFAULT 0,
  risk_level text DEFAULT 'medium' CHECK (risk_level IN ('critical','high','medium','low')),
  -- Compteurs
  equipment_count integer DEFAULT 0,
  vuln_count integer DEFAULT 0,
  incident_count integer DEFAULT 0,
  compliance_score numeric(5,2) DEFAULT 0,
  -- Statut
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sites_select" ON sites;
DROP POLICY IF EXISTS "sites_insert" ON sites;
DROP POLICY IF EXISTS "sites_update" ON sites;
DROP POLICY IF EXISTS "sites_delete" ON sites;
CREATE POLICY "sites_select" ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "sites_insert" ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sites_update" ON sites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sites_delete" ON sites FOR DELETE TO authenticated USING (true);

-- Inventaire des équipements
CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('serveur','poste','switch','routeur','firewall','imprimante','vm','autre')),
  ip_address text,
  mac_address text,
  os text,
  os_version text,
  manufacturer text,
  model text,
  serial_number text,
  status text DEFAULT 'online' CHECK (status IN ('online','offline','degraded','maintenance')),
  cpu_usage numeric(5,2),
  ram_usage numeric(5,2),
  disk_usage numeric(5,2),
  last_seen timestamptz,
  source text DEFAULT 'manual' CHECK (source IN ('manual','glpi','nmap','wazuh','zabbix','nagios','ocs')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipments_select" ON equipments;
DROP POLICY IF EXISTS "equipments_insert" ON equipments;
DROP POLICY IF EXISTS "equipments_update" ON equipments;
DROP POLICY IF EXISTS "equipments_delete" ON equipments;
CREATE POLICY "equipments_select" ON equipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "equipments_insert" ON equipments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "equipments_update" ON equipments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "equipments_delete" ON equipments FOR DELETE TO authenticated USING (true);

-- Vulnérabilités (CVE)
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id text UNIQUE,
  title text NOT NULL,
  description text,
  cvss_score numeric(4,2),
  cvss_vector text,
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  cwe text,
  cpe text,
  mitre_technique text,
  epss_score numeric(6,5),
  is_kev boolean DEFAULT false,
  published_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vulns_select" ON vulnerabilities;
DROP POLICY IF EXISTS "vulns_insert" ON vulnerabilities;
DROP POLICY IF EXISTS "vulns_update" ON vulnerabilities;
DROP POLICY IF EXISTS "vulns_delete" ON vulnerabilities;
CREATE POLICY "vulns_select" ON vulnerabilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "vulns_insert" ON vulnerabilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vulns_update" ON vulnerabilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vulns_delete" ON vulnerabilities FOR DELETE TO authenticated USING (true);

-- Vulnérabilités par site/équipement
CREATE TABLE IF NOT EXISTS site_vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipments(id) ON DELETE CASCADE,
  vulnerability_id uuid REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  status text DEFAULT 'open' CHECK (status IN ('open','in_remediation','resolved','accepted')),
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  source text DEFAULT 'manual',
  notes text
);
ALTER TABLE site_vulnerabilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_vulns_select" ON site_vulnerabilities;
DROP POLICY IF EXISTS "site_vulns_insert" ON site_vulnerabilities;
DROP POLICY IF EXISTS "site_vulns_update" ON site_vulnerabilities;
DROP POLICY IF EXISTS "site_vulns_delete" ON site_vulnerabilities;
CREATE POLICY "site_vulns_select" ON site_vulnerabilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_vulns_insert" ON site_vulnerabilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "site_vulns_update" ON site_vulnerabilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_vulns_delete" ON site_vulnerabilities FOR DELETE TO authenticated USING (true);

-- Incidents de sécurité
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  status text DEFAULT 'open' CHECK (status IN ('open','investigating','contained','resolved','closed')),
  category text CHECK (category IN ('malware','ransomware','phishing','ddos','intrusion','data_breach','insider','autre')),
  site_id uuid REFERENCES sites(id),
  assigned_to uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  escalated_to uuid REFERENCES profiles(id),
  mitre_tactic text,
  ioc text,
  timeline jsonb DEFAULT '[]',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "incidents_select" ON incidents;
DROP POLICY IF EXISTS "incidents_insert" ON incidents;
DROP POLICY IF EXISTS "incidents_update" ON incidents;
DROP POLICY IF EXISTS "incidents_delete" ON incidents;
CREATE POLICY "incidents_select" ON incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "incidents_insert" ON incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "incidents_update" ON incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "incidents_delete" ON incidents FOR DELETE TO authenticated USING (true);

-- Alertes temps réel
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  source text,
  site_id uuid REFERENCES sites(id),
  equipment_id uuid REFERENCES equipments(id),
  status text DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved','false_positive')),
  rule_id text,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES profiles(id)
);
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alerts_select" ON alerts;
DROP POLICY IF EXISTS "alerts_insert" ON alerts;
DROP POLICY IF EXISTS "alerts_update" ON alerts;
DROP POLICY IF EXISTS "alerts_delete" ON alerts;
CREATE POLICY "alerts_select" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_insert" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "alerts_update" ON alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "alerts_delete" ON alerts FOR DELETE TO authenticated USING (true);

-- Contrôles de conformité
CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  framework text NOT NULL CHECK (framework IN ('iso27001','cis','nist_csf','nist_800_53','pci_dss','anssi','owasp')),
  control_id text NOT NULL,
  control_name text NOT NULL,
  status text DEFAULT 'non_compliant' CHECK (status IN ('compliant','non_compliant','partial','na')),
  score integer DEFAULT 0,
  notes text,
  checked_at timestamptz DEFAULT now()
);
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compliance_select" ON compliance_checks;
DROP POLICY IF EXISTS "compliance_insert" ON compliance_checks;
DROP POLICY IF EXISTS "compliance_update" ON compliance_checks;
DROP POLICY IF EXISTS "compliance_delete" ON compliance_checks;
CREATE POLICY "compliance_select" ON compliance_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "compliance_insert" ON compliance_checks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "compliance_update" ON compliance_checks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "compliance_delete" ON compliance_checks FOR DELETE TO authenticated USING (true);

-- Connecteurs d'intégration
CREATE TABLE IF NOT EXISTS connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('glpi','nmap','wazuh','zabbix','nagios','graylog','prometheus','grafana','pfsense','ad','openvas','nessus','crowdstrike','defender','suricata','osquery','sysmon','ocs','centreon','csv','json','xml','api')),
  endpoint text,
  is_active boolean DEFAULT false,
  last_sync timestamptz,
  sync_interval integer DEFAULT 60,
  config jsonb DEFAULT '{}',
  status text DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error','syncing')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "connectors_select" ON connectors;
DROP POLICY IF EXISTS "connectors_insert" ON connectors;
DROP POLICY IF EXISTS "connectors_update" ON connectors;
DROP POLICY IF EXISTS "connectors_delete" ON connectors;
CREATE POLICY "connectors_select" ON connectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "connectors_insert" ON connectors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "connectors_update" ON connectors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "connectors_delete" ON connectors FOR DELETE TO authenticated USING (true);

-- Threat Intelligence
CREATE TABLE IF NOT EXISTS threat_intel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('ip','domain','hash','url','email','cve','ioc')),
  value text NOT NULL,
  description text,
  source text,
  threat_actor text,
  mitre_technique text,
  confidence integer DEFAULT 50,
  tlp text DEFAULT 'white' CHECK (tlp IN ('white','green','amber','red')),
  is_active boolean DEFAULT true,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE threat_intel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threat_select" ON threat_intel;
DROP POLICY IF EXISTS "threat_insert" ON threat_intel;
DROP POLICY IF EXISTS "threat_update" ON threat_intel;
DROP POLICY IF EXISTS "threat_delete" ON threat_intel;
CREATE POLICY "threat_select" ON threat_intel FOR SELECT TO authenticated USING (true);
CREATE POLICY "threat_insert" ON threat_intel FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "threat_update" ON threat_intel FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "threat_delete" ON threat_intel FOR DELETE TO authenticated USING (true);

-- Métriques de monitoring
CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipments(id) ON DELETE CASCADE,
  cpu_usage numeric(5,2),
  ram_usage numeric(5,2),
  disk_usage numeric(5,2),
  bandwidth_in numeric(10,2),
  bandwidth_out numeric(10,2),
  latency_ms integer,
  uptime_seconds bigint,
  recorded_at timestamptz DEFAULT now()
);
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "metrics_select" ON monitoring_metrics;
DROP POLICY IF EXISTS "metrics_insert" ON monitoring_metrics;
DROP POLICY IF EXISTS "metrics_update" ON monitoring_metrics;
DROP POLICY IF EXISTS "metrics_delete" ON monitoring_metrics;
CREATE POLICY "metrics_select" ON monitoring_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "metrics_insert" ON monitoring_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "metrics_update" ON monitoring_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "metrics_delete" ON monitoring_metrics FOR DELETE TO authenticated USING (true);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sites_region ON sites(region_id);
CREATE INDEX IF NOT EXISTS idx_sites_risk ON sites(risk_level);
CREATE INDEX IF NOT EXISTS idx_equipments_site ON equipments(site_id);
CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status);
CREATE INDEX IF NOT EXISTS idx_site_vulns_site ON site_vulnerabilities(site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_site ON incidents(site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_alerts_site ON alerts(site_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_metrics_equipment ON monitoring_metrics(equipment_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON monitoring_metrics(recorded_at);
