export type SiteType = 'ministere' | 'direction' | 'mairie' | 'societe_etat' | 'ong' | 'privee' | 'autre';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'false_positive';
export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
export type ConnectorType = 'glpi' | 'nmap' | 'wazuh' | 'zabbix' | 'nagios' | 'graylog' | 'prometheus' | 'grafana' | 'pfsense' | 'ad' | 'openvas' | 'nessus' | 'crowdstrike' | 'defender' | 'suricata' | 'osquery' | 'sysmon' | 'ocs' | 'centreon' | 'csv' | 'json' | 'xml' | 'api';
export type ComplianceFramework = 'iso27001' | 'cis' | 'nist_csf' | 'nist_800_53' | 'pci_dss' | 'anssi' | 'owasp';
export type ThreatIntelType = 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'cve' | 'ioc';

export interface Region {
  id: string;
  name: string;
  code: string;
  chef_lieu: string | null;
}

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  ministere: string | null;
  organisme: string | null;
  region_id: string | null;
  province: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  resp_it_name: string | null;
  resp_it_phone: string | null;
  resp_it_email: string | null;
  ip_range: string | null;
  vlan: string | null;
  has_firewall: boolean;
  has_vpn: boolean;
  has_ad: boolean;
  has_backup: boolean;
  has_mfa: boolean;
  has_antivirus: boolean;
  has_edr: boolean;
  has_monitoring: boolean;
  has_updates: boolean;
  has_network_seg: boolean;
  has_cis_compliance: boolean;
  cyber_score: number;
  risk_level: RiskLevel;
  equipment_count: number;
  vuln_count: number;
  incident_count: number;
  compliance_score: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  region?: Region;
}

export interface Equipment {
  id: string;
  site_id: string;
  name: string;
  type: 'serveur' | 'poste' | 'switch' | 'routeur' | 'firewall' | 'imprimante' | 'vm' | 'autre';
  ip_address: string | null;
  mac_address: string | null;
  os: string | null;
  os_version: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  cpu_usage: number | null;
  ram_usage: number | null;
  disk_usage: number | null;
  last_seen: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Vulnerability {
  id: string;
  cve_id: string;
  title: string;
  description: string | null;
  cvss_score: number;
  cvss_vector: string | null;
  severity: Severity;
  cwe: string | null;
  cpe: string | null;
  mitre_technique: string | null;
  epss_score: number | null;
  is_kev: boolean;
  published_date: string | null;
}

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: IncidentStatus;
  category: string | null;
  site_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  escalated_to: string | null;
  mitre_tactic: string | null;
  ioc: string | null;
  timeline: any[];
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  site?: Site;
}

export interface Alert {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  source: string | null;
  site_id: string | null;
  equipment_id: string | null;
  status: AlertStatus;
  rule_id: string | null;
  raw_data: any;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  site?: Site;
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  endpoint: string | null;
  is_active: boolean;
  last_sync: string | null;
  sync_interval: number;
  config: any;
  status: ConnectorStatus;
  created_at: string;
}

export interface ComplianceCheck {
  id: string;
  site_id: string;
  framework: ComplianceFramework;
  control_id: string;
  control_name: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'na';
  score: number;
  notes: string | null;
  checked_at: string;
  site?: Site;
}

export interface ThreatIntel {
  id: string;
  type: ThreatIntelType;
  value: string;
  description: string | null;
  source: string | null;
  threat_actor: string | null;
  mitre_technique: string | null;
  confidence: number;
  tlp: 'white' | 'green' | 'amber' | 'red';
  is_active: boolean;
  first_seen: string;
  last_seen: string;
}

export interface MonitoringMetric {
  id: string;
  equipment_id: string;
  cpu_usage: number | null;
  ram_usage: number | null;
  disk_usage: number | null;
  bandwidth_in: number | null;
  bandwidth_out: number | null;
  latency_ms: number | null;
  uptime_seconds: number | null;
  recorded_at: string;
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#6b7280',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const SITE_TYPE_LABELS: Record<SiteType, string> = {
  ministere: 'Ministère',
  direction: 'Direction',
  mairie: 'Mairie',
  societe_etat: 'Société d\'État',
  ong: 'ONG',
  privee: 'Privé',
  autre: 'Autre',
};

export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  glpi: 'GLPI',
  nmap: 'Nmap',
  wazuh: 'Wazuh',
  zabbix: 'Zabbix',
  nagios: 'Nagios',
  graylog: 'Graylog',
  prometheus: 'Prometheus',
  grafana: 'Grafana',
  pfsense: 'pfSense',
  ad: 'Active Directory',
  openvas: 'OpenVAS',
  nessus: 'Nessus',
  crowdstrike: 'CrowdStrike',
  defender: 'MS Defender',
  suricata: 'Suricata',
  osquery: 'OSQuery',
  sysmon: 'Sysmon',
  ocs: 'OCS Inventory',
  centreon: 'Centreon',
  csv: 'CSV',
  json: 'JSON',
  xml: 'XML',
  api: 'API REST',
};

export const FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  iso27001: 'ISO 27001',
  cis: 'CIS Benchmark',
  nist_csf: 'NIST CSF',
  nist_800_53: 'NIST 800-53',
  pci_dss: 'PCI DSS',
  anssi: 'ANSSI',
  owasp: 'OWASP Top 10',
};
