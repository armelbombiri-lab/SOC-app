
/*
# Update RLS policies to anon-accessible for demo mode

## Description
La plateforme est une démonstration nationale avec données fictives.
Le RBAC est géré côté frontend via un sélecteur de rôle.
Toutes les tables sont accessibles en lecture/écriture via la clé anon.

## Changements
- Toutes les politiques passent de `authenticated` à `anon, authenticated`
*/

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO anon, authenticated USING (true);

-- sites
DROP POLICY IF EXISTS "sites_select" ON sites;
CREATE POLICY "sites_select" ON sites FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sites_insert" ON sites;
CREATE POLICY "sites_insert" ON sites FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sites_update" ON sites;
CREATE POLICY "sites_update" ON sites FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sites_delete" ON sites;
CREATE POLICY "sites_delete" ON sites FOR DELETE TO anon, authenticated USING (true);

-- equipments
DROP POLICY IF EXISTS "equipments_select" ON equipments;
CREATE POLICY "equipments_select" ON equipments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "equipments_insert" ON equipments;
CREATE POLICY "equipments_insert" ON equipments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "equipments_update" ON equipments;
CREATE POLICY "equipments_update" ON equipments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "equipments_delete" ON equipments;
CREATE POLICY "equipments_delete" ON equipments FOR DELETE TO anon, authenticated USING (true);

-- vulnerabilities
DROP POLICY IF EXISTS "vulns_select" ON vulnerabilities;
CREATE POLICY "vulns_select" ON vulnerabilities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "vulns_insert" ON vulnerabilities;
CREATE POLICY "vulns_insert" ON vulnerabilities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "vulns_update" ON vulnerabilities;
CREATE POLICY "vulns_update" ON vulnerabilities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "vulns_delete" ON vulnerabilities;
CREATE POLICY "vulns_delete" ON vulnerabilities FOR DELETE TO anon, authenticated USING (true);

-- site_vulnerabilities
DROP POLICY IF EXISTS "site_vulns_select" ON site_vulnerabilities;
CREATE POLICY "site_vulns_select" ON site_vulnerabilities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_vulns_insert" ON site_vulnerabilities;
CREATE POLICY "site_vulns_insert" ON site_vulnerabilities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "site_vulns_update" ON site_vulnerabilities;
CREATE POLICY "site_vulns_update" ON site_vulnerabilities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "site_vulns_delete" ON site_vulnerabilities;
CREATE POLICY "site_vulns_delete" ON site_vulnerabilities FOR DELETE TO anon, authenticated USING (true);

-- incidents
DROP POLICY IF EXISTS "incidents_select" ON incidents;
CREATE POLICY "incidents_select" ON incidents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "incidents_insert" ON incidents;
CREATE POLICY "incidents_insert" ON incidents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "incidents_update" ON incidents;
CREATE POLICY "incidents_update" ON incidents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "incidents_delete" ON incidents;
CREATE POLICY "incidents_delete" ON incidents FOR DELETE TO anon, authenticated USING (true);

-- alerts
DROP POLICY IF EXISTS "alerts_select" ON alerts;
CREATE POLICY "alerts_select" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "alerts_insert" ON alerts;
CREATE POLICY "alerts_insert" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "alerts_update" ON alerts;
CREATE POLICY "alerts_update" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "alerts_delete" ON alerts;
CREATE POLICY "alerts_delete" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- compliance_checks
DROP POLICY IF EXISTS "compliance_select" ON compliance_checks;
CREATE POLICY "compliance_select" ON compliance_checks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "compliance_insert" ON compliance_checks;
CREATE POLICY "compliance_insert" ON compliance_checks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "compliance_update" ON compliance_checks;
CREATE POLICY "compliance_update" ON compliance_checks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "compliance_delete" ON compliance_checks;
CREATE POLICY "compliance_delete" ON compliance_checks FOR DELETE TO anon, authenticated USING (true);

-- connectors
DROP POLICY IF EXISTS "connectors_select" ON connectors;
CREATE POLICY "connectors_select" ON connectors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "connectors_insert" ON connectors;
CREATE POLICY "connectors_insert" ON connectors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "connectors_update" ON connectors;
CREATE POLICY "connectors_update" ON connectors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "connectors_delete" ON connectors;
CREATE POLICY "connectors_delete" ON connectors FOR DELETE TO anon, authenticated USING (true);

-- threat_intel
DROP POLICY IF EXISTS "threat_select" ON threat_intel;
CREATE POLICY "threat_select" ON threat_intel FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "threat_insert" ON threat_intel;
CREATE POLICY "threat_insert" ON threat_intel FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "threat_update" ON threat_intel;
CREATE POLICY "threat_update" ON threat_intel FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "threat_delete" ON threat_intel;
CREATE POLICY "threat_delete" ON threat_intel FOR DELETE TO anon, authenticated USING (true);

-- monitoring_metrics
DROP POLICY IF EXISTS "metrics_select" ON monitoring_metrics;
CREATE POLICY "metrics_select" ON monitoring_metrics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "metrics_insert" ON monitoring_metrics;
CREATE POLICY "metrics_insert" ON monitoring_metrics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "metrics_update" ON monitoring_metrics;
CREATE POLICY "metrics_update" ON monitoring_metrics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "metrics_delete" ON monitoring_metrics;
CREATE POLICY "metrics_delete" ON monitoring_metrics FOR DELETE TO anon, authenticated USING (true);
