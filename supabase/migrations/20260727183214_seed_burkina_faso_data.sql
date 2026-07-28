
/*
# Seed fictive data for Burkina Faso SOC platform

## Description
Données fictives réalistes pour la plateforme nationale SOC du Burkina Faso.
- 13 régions administratives
- ~40 sites gouvernementaux
- Connecteurs, vulnérabilités CVE, threat intelligence
*/

-- Régions du Burkina Faso
INSERT INTO regions (name, code, chef_lieu) VALUES
('Boucle du Mouhoun', 'BM', 'Dédougou'),
('Cascades', 'CD', 'Banfora'),
('Centre', 'CE', 'Ouagadougou'),
('Centre-Est', 'CE-EST', 'Tenkodogo'),
('Centre-Nord', 'CE-NORD', 'Kaya'),
('Centre-Ouest', 'CE-OUEST', 'Koudougou'),
('Centre-Sud', 'CE-SUD', 'Manga'),
('Est', 'EST', 'Fada N''Gourma'),
('Hauts-Bassins', 'HB', 'Bobo-Dioulasso'),
('Nord', 'NORD', 'Ouahigouya'),
('Plateau-Central', 'PLT', 'Ziniaré'),
('Sahel', 'SAHEL', 'Dori'),
('Sud-Ouest', 'SUD-OUEST', 'Gaoua')
ON CONFLICT (code) DO NOTHING;

-- Sites gouvernementaux fictifs (insertion par groupes)
DO $$
DECLARE
  r_centre uuid; r_hb uuid; r_nord uuid; r_est uuid; r_sud_ouest uuid; r_boucle uuid; r_cascades uuid; r_plateau uuid; r_sahel uuid; r_centre_ouest uuid; r_centre_est uuid; r_centre_nord uuid; r_centre_sud uuid;
BEGIN
  SELECT id INTO r_centre FROM regions WHERE code='CE' LIMIT 1;
  SELECT id INTO r_hb FROM regions WHERE code='HB' LIMIT 1;
  SELECT id INTO r_nord FROM regions WHERE code='NORD' LIMIT 1;
  SELECT id INTO r_est FROM regions WHERE code='EST' LIMIT 1;
  SELECT id INTO r_sud_ouest FROM regions WHERE code='SUD-OUEST' LIMIT 1;
  SELECT id INTO r_boucle FROM regions WHERE code='BM' LIMIT 1;
  SELECT id INTO r_cascades FROM regions WHERE code='CD' LIMIT 1;
  SELECT id INTO r_plateau FROM regions WHERE code='PLT' LIMIT 1;
  SELECT id INTO r_sahel FROM regions WHERE code='SAHEL' LIMIT 1;
  SELECT id INTO r_centre_ouest FROM regions WHERE code='CE-OUEST' LIMIT 1;
  SELECT id INTO r_centre_est FROM regions WHERE code='CE-EST' LIMIT 1;
  SELECT id INTO r_centre_nord FROM regions WHERE code='CE-NORD' LIMIT 1;
  SELECT id INTO r_centre_sud FROM regions WHERE code='CE-SUD' LIMIT 1;

  -- Centre (Ouagadougou) - Partie 1
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Ministère de l''Administration Territoriale', 'ministere', 'MATD', 'Direction Générale', r_centre, 'Kadiogo', 'Ouagadougou', 12.3714, -1.5259, 'Avenue de l''Indépendance, Ouaga', 'Issouf Sawadogo', '+226 70 12 34 56', 'it@matd.gov.bf', '192.168.10.0/24', 'VLAN10', true, true, true, true, false, true, false, true, true, true, false, 65, 'medium', 142, 18, 3, 72.5, 'active'),
  ('Ministère de la Santé', 'ministere', 'MS', 'Direction Générale', r_centre, 'Kadiogo', 'Ouagadougou', 12.3569, -1.5471, 'Ouaga 2000', 'Aïcha Ouédraogo', '+226 70 23 45 67', 'it@ms.gov.bf', '10.10.0.0/16', 'VLAN20', true, true, true, true, true, true, true, true, true, true, true, 82, 'low', 287, 9, 1, 88.0, 'active'),
  ('Ministère de l''Éducation Nationale', 'ministere', 'MENA', 'Direction Générale', r_centre, 'Kadiogo', 'Ouagadougou', 12.3642, -1.5333, 'Zone des Ministères', 'Boukary Zongo', '+226 70 34 56 78', 'it@mena.gov.bf', '172.16.0.0/16', 'VLAN30', true, false, true, false, false, true, false, false, false, false, false, 48, 'high', 198, 34, 5, 55.0, 'active'),
  ('Assemblée Nationale', 'direction', 'AN', 'Bureau Exécutif', r_centre, 'Kadiogo', 'Ouagadougou', 12.3592, -1.5397, 'Avenue Kwame N''Krumah', 'Salif Compaoré', '+226 70 45 67 89', 'it@an.bf', '10.20.0.0/16', 'VLAN40', true, true, true, true, true, true, true, true, true, true, true, 88, 'low', 156, 6, 0, 90.0, 'active'),
  ('Mairie de Ouagadougou', 'mairie', 'MOCV', 'Mairie Centrale', r_centre, 'Kadiogo', 'Ouagadougou', 12.3572, -1.5388, 'Place de la Nation', 'Fatimata Traoré', '+226 70 56 78 90', 'it@mairie-ouaga.bf', '192.168.20.0/24', 'VLAN50', true, false, true, true, false, true, false, true, false, false, false, 58, 'medium', 98, 22, 4, 60.0, 'active');

  -- Centre - Partie 2
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('SONABEL', 'societe_etat', 'SONABEL', 'Siège Social', r_centre, 'Kadiogo', 'Ouagadougou', 12.3653, -1.5210, 'ZAD, Ouaga', 'Moussa Kaboré', '+226 70 67 89 01', 'it@sonabel.bf', '10.30.0.0/16', 'VLAN60', true, true, true, true, true, true, true, true, true, false, false, 78, 'medium', 412, 27, 6, 80.0, 'active'),
  ('ONATEL', 'societe_etat', 'ONATEL', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3698, -1.5189, 'Avenue de l''UEMOA', 'Adama Diallo', '+226 70 78 90 12', 'it@onatel.bf', '10.40.0.0/16', 'VLAN70', true, true, true, true, true, true, true, true, true, true, true, 85, 'low', 534, 8, 2, 92.0, 'active'),
  ('Direction Générale des Impôts', 'direction', 'DGI', 'Bureau Central', r_centre, 'Kadiogo', 'Ouagadougou', 12.3612, -1.5298, 'Avenue de l''Indépendance', 'Ramatou Sawadogo', '+226 70 89 01 23', 'it@impots.bf', '192.168.30.0/24', 'VLAN80', true, true, true, true, false, true, true, true, true, false, false, 72, 'medium', 167, 15, 3, 75.0, 'active'),
  ('BCEAO Burkina', 'direction', 'BCEAO', 'Bureau BF', r_centre, 'Kadiogo', 'Ouagadougou', 12.3588, -1.5412, 'Avenue de la Révolution', 'Ibrahim Ouattara', '+226 70 90 12 34', 'it@bceao.bf', '10.50.0.0/16', 'VLAN90', true, true, true, true, true, true, true, true, true, true, true, 92, 'low', 89, 3, 0, 95.0, 'active'),
  ('Ministère de la Défense', 'ministere', 'MDN', 'État-Major', r_centre, 'Kadiogo', 'Ouagadougou', 12.3720, -1.5090, 'Quartier Général', 'Col. Karim Traoré', '+226 70 01 12 23', 'it@defense.gov.bf', '10.60.0.0/16', 'VLAN100', true, true, true, true, true, true, true, true, true, true, true, 90, 'low', 234, 4, 1, 93.0, 'active');

  -- Centre - Partie 3
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Université Joseph Ki-Zerbo', 'direction', 'UJKZ', 'Campus Universitaire', r_centre, 'Kadiogo', 'Ouagadougou', 12.3758, -1.5167, 'Campus de Zogona', 'Pascal Yaméogo', '+226 70 12 23 45', 'it@ujkz.bf', '172.17.0.0/16', 'VLAN110', true, false, true, false, false, true, false, true, false, false, false, 52, 'high', 345, 41, 7, 58.0, 'active'),
  ('Hôpital Yalgado Ouédraogo', 'direction', 'CHUYO', 'Direction', r_centre, 'Kadiogo', 'Ouagadougou', 12.3691, -1.5345, 'Avenue de l''Hôpital', 'Dr. Aminata Sankara', '+226 70 23 34 56', 'it@chuyo.bf', '192.168.40.0/24', 'VLAN120', true, true, true, true, false, true, false, true, true, false, false, 68, 'medium', 178, 19, 4, 70.0, 'active'),
  ('ONER', 'societe_etat', 'ONER', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3633, -1.5277, 'Zone des Ministères', 'Nikiéma Boureima', '+226 70 34 45 67', 'it@oner.bf', '10.70.0.0/16', 'VLAN130', true, false, false, false, false, true, false, false, false, false, false, 35, 'critical', 87, 52, 9, 40.0, 'active'),
  ('Orange Burkina', 'privee', 'OBF', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3700, -1.5300, 'Avenue de l''UEMOA', 'Cheick Diallo', '+226 70 12 34 56', 'it@orange.bf', '10.200.0.0/16', 'VLAN410', true, true, true, true, true, true, true, true, true, true, true, 90, 'low', 678, 5, 1, 94.0, 'active'),
  ('Coris Bank', 'privee', 'CB', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3680, -1.5350, 'Avenue de l''Indépendance', 'Boureima Ouédraogo', '+226 70 23 45 67', 'it@coris.bf', '10.210.0.0/16', 'VLAN420', true, true, true, true, true, true, true, true, true, true, true, 92, 'low', 456, 4, 0, 95.0, 'active');

  -- Centre - Partie 4 (ONG + autres)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Ecobank Burkina', 'privee', 'EB', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3650, -1.5380, 'Zone des Affaires', 'Adama Sankara', '+226 70 34 56 78', 'it@ecobank.bf', '10.220.0.0/16', 'VLAN430', true, true, true, true, true, true, true, true, true, true, true, 91, 'low', 389, 6, 1, 93.0, 'active'),
  ('OCADES Caritas Burkina', 'ong', 'OCADES', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3620, -1.5410, 'Cathédrale', 'Sr Marie Ouédraogo', '+226 70 45 56 78', 'it@ocades.bf', '192.168.200.0/24', 'VLAN440', true, false, true, true, false, true, false, true, false, false, false, 62, 'medium', 78, 16, 2, 65.0, 'active'),
  ('Croix-Rouge Burkina Faso', 'ong', 'CRBF', 'Siège', r_centre, 'Kadiogo', 'Ouagadougou', 12.3600, -1.5420, 'Zone du Bassin', 'Antoine Kaboré', '+226 70 56 67 89', 'it@croixrouge.bf', '192.168.210.0/24', 'VLAN450', true, false, true, true, false, true, false, true, false, false, false, 60, 'medium', 67, 18, 3, 62.0, 'active');

  -- Hauts-Bassins (Bobo-Dioulasso)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Bobo-Dioulasso', 'mairie', 'MOB', 'Mairie', r_hb, 'Houet', 'Bobo-Dioulasso', 11.1716, -4.2970, 'Centre-ville Bobo', 'Issa Traoré', '+226 70 56 67 89', 'it@mairie-bobo.bf', '192.168.50.0/24', 'VLAN150', true, false, true, true, false, true, false, true, false, false, false, 62, 'medium', 112, 21, 3, 65.0, 'active'),
  ('Université Nazi Boni', 'direction', 'UNB', 'Campus', r_hb, 'Houet', 'Bobo-Dioulasso', 11.1793, -4.3081, 'Campus Universitaire', 'Salif Ouédraogo', '+226 70 67 78 90', 'it@unb.bf', '172.18.0.0/16', 'VLAN160', true, false, true, false, false, true, false, true, false, false, false, 55, 'high', 267, 38, 6, 60.0, 'active'),
  ('CHU Sourô Sanou', 'direction', 'CHUSS', 'Direction', r_hb, 'Houet', 'Bobo-Dioulasso', 11.1633, -4.2889, 'Quartier du CHU', 'Dr. Mahama Kone', '+226 70 78 89 01', 'it@chuss.bf', '192.168.60.0/24', 'VLAN170', true, true, true, true, false, true, false, true, true, false, false, 70, 'medium', 145, 17, 3, 72.0, 'active'),
  ('DRA Hauts-Bassins', 'direction', 'DRAH', 'Bureau', r_hb, 'Houet', 'Bobo-Dioulasso', 11.1745, -4.3012, 'Quartier Commercial', 'Bassirou Sanou', '+226 70 89 90 12', 'it@dra-hb.bf', '10.90.0.0/16', 'VLAN180', false, false, false, false, false, true, false, false, false, false, false, 25, 'critical', 56, 47, 8, 30.0, 'active'),
  ('SOFITEX', 'societe_etat', 'SOFITEX', 'Siège', r_hb, 'Houet', 'Bobo-Dioulasso', 11.1689, -4.2956, 'Zone Industrielle', 'Abdoulaye Compaoré', '+226 70 90 01 23', 'it@sofitex.bf', '10.100.0.0/16', 'VLAN190', true, true, true, true, true, true, true, true, true, false, false, 80, 'low', 389, 11, 2, 82.0, 'active');

  -- Nord (Ouahigouya)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Ouahigouya', 'mairie', 'MOU', 'Mairie', r_nord, 'Yatenga', 'Ouahigouya', 13.5833, -2.3500, 'Centre Ouahigouya', 'Karim Sawadogo', '+226 70 01 12 34', 'it@mairie-ouahi.bf', '192.168.70.0/24', 'VLAN200', true, false, true, true, false, true, false, true, false, false, false, 60, 'medium', 78, 19, 2, 62.0, 'active'),
  ('Direction Régionale du Nord', 'direction', 'DRN', 'Bureau', r_nord, 'Yatenga', 'Ouahigouya', 13.5750, -2.3550, 'Quartier Administratif', 'Fatou Zongo', '+226 70 12 23 45', 'it@dr-nord.bf', '10.110.0.0/16', 'VLAN210', false, false, false, false, false, true, false, false, false, false, false, 22, 'critical', 45, 39, 7, 28.0, 'active'),
  ('Hôpital Régional de Ouahigouya', 'direction', 'HRO', 'Direction', r_nord, 'Yatenga', 'Ouahigouya', 13.5800, -2.3480, 'Quartier de l''Hôpital', 'Dr. Hamidou Ouédraogo', '+226 70 23 34 56', 'it@hro.bf', '192.168.80.0/24', 'VLAN220', true, false, true, true, false, true, false, true, true, false, false, 65, 'medium', 98, 16, 2, 68.0, 'active');

  -- Est (Fada N'Gourma)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Fada N''Gourma', 'mairie', 'MFG', 'Mairie', r_est, 'Gourma', 'Fada N''Gourma', 12.0600, 0.5200, 'Centre Fada', 'Ousmane Diallo', '+226 70 34 45 67', 'it@mairie-fada.bf', '192.168.90.0/24', 'VLAN230', false, false, false, false, false, true, false, false, false, false, false, 28, 'critical', 34, 44, 6, 32.0, 'active'),
  ('Direction Régionale de l''Est', 'direction', 'DRE', 'Bureau', r_est, 'Gourma', 'Fada N''Gourma', 12.0633, 0.5167, 'Quartier Administratif', 'Aminata Compaoré', '+226 70 45 56 78', 'it@dr-est.bf', '10.120.0.0/16', 'VLAN240', false, false, false, false, false, true, false, false, false, false, false, 25, 'critical', 41, 42, 8, 30.0, 'active');

  -- Sud-Ouest (Gaoua)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Gaoua', 'mairie', 'MGA', 'Mairie', r_sud_ouest, 'Poni', 'Gaoua', 10.3300, -3.1800, 'Centre Gaoua', 'Thierry Hien', '+226 70 56 67 89', 'it@mairie-gaoua.bf', '192.168.100.0/24', 'VLAN250', true, false, true, false, false, true, false, false, false, false, false, 42, 'high', 52, 28, 4, 48.0, 'active'),
  ('Direction Régionale Sud-Ouest', 'direction', 'DRSO', 'Bureau', r_sud_ouest, 'Poni', 'Gaoua', 10.3333, -3.1833, 'Quartier Administratif', 'Mariam Kaboré', '+226 70 67 78 90', 'it@dr-so.bf', '10.130.0.0/16', 'VLAN260', false, false, false, false, false, true, false, false, false, false, false, 24, 'critical', 38, 45, 7, 28.0, 'active');

  -- Boucle du Mouhoun (Dédougou)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Dédougou', 'mairie', 'MDD', 'Mairie', r_boucle, 'Mouhoun', 'Dédougou', 12.4667, -3.4667, 'Centre Dédougou', 'Adama Hien', '+226 70 78 89 01', 'it@mairie-ded.bf', '192.168.110.0/24', 'VLAN270', true, false, true, true, false, true, false, true, false, false, false, 58, 'medium', 67, 20, 2, 60.0, 'active'),
  ('Direction Régionale Boucle du Mouhoun', 'direction', 'DRBM', 'Bureau', r_boucle, 'Mouhoun', 'Dédougou', 12.4700, -3.4700, 'Quartier Administratif', 'Salimata Ouédraogo', '+226 70 89 90 12', 'it@dr-bm.bf', '10.140.0.0/16', 'VLAN280', false, false, false, false, false, true, false, false, false, false, false, 26, 'critical', 43, 41, 6, 30.0, 'active');

  -- Cascades (Banfora)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Banfora', 'mairie', 'MBA', 'Mairie', r_cascades, 'Comoé', 'Banfora', 10.6333, -4.7833, 'Centre Banfora', 'Seydou Sankara', '+226 70 90 01 23', 'it@mairie-ban.bf', '192.168.120.0/24', 'VLAN290', true, false, true, false, false, true, false, false, false, false, false, 45, 'high', 58, 26, 3, 50.0, 'active'),
  ('SOSUCO (Sucrière)', 'societe_etat', 'SOSUCO', 'Usine', r_cascades, 'Comoé', 'Banfora', 10.6400, -4.7900, 'Zone Industrielle', 'Bakary Traoré', '+226 70 01 12 34', 'it@sosuco.bf', '10.150.0.0/16', 'VLAN300', true, true, true, true, false, true, true, true, true, false, false, 75, 'medium', 234, 13, 2, 78.0, 'active');

  -- Plateau-Central (Ziniaré)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Ziniaré', 'mairie', 'MZA', 'Mairie', r_plateau, 'Oubritenga', 'Ziniaré', 12.5833, -1.2833, 'Centre Ziniaré', 'Kassoum Ouédraogo', '+226 70 12 23 45', 'it@mairie-zin.bf', '192.168.130.0/24', 'VLAN310', false, false, false, false, false, true, false, false, false, false, false, 30, 'critical', 41, 38, 5, 35.0, 'active'),
  ('Maison du Peuple de Ziniaré', 'direction', 'MDP', 'Bureau', r_plateau, 'Oubritenga', 'Ziniaré', 12.5867, -1.2800, 'Avenue de la Révolution', 'Adèle Sawadogo', '+226 70 23 34 56', 'it@mdp-zin.bf', '10.160.0.0/16', 'VLAN320', false, false, false, false, false, true, false, false, false, false, false, 27, 'critical', 36, 40, 6, 32.0, 'active');

  -- Sahel (Dori)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Dori', 'mairie', 'MDO', 'Mairie', r_sahel, 'Séno', 'Dori', 14.0333, -0.4167, 'Centre Dori', 'Hamadou Diallo', '+226 70 34 45 67', 'it@mairie-dori.bf', '192.168.140.0/24', 'VLAN330', false, false, false, false, false, true, false, false, false, false, false, 22, 'critical', 29, 43, 7, 25.0, 'active'),
  ('Direction Régionale du Sahel', 'direction', 'DRS', 'Bureau', r_sahel, 'Séno', 'Dori', 14.0367, -0.4200, 'Quartier Administratif', 'Awa Kaboré', '+226 70 45 56 78', 'it@dr-sahel.bf', '10.170.0.0/16', 'VLAN340', false, false, false, false, false, true, false, false, false, false, false, 20, 'critical', 25, 46, 9, 22.0, 'active');

  -- Centre-Ouest (Koudougou)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Koudougou', 'mairie', 'MKO', 'Mairie', r_centre_ouest, 'Boulkiemdé', 'Koudougou', 12.2500, -2.0333, 'Centre Koudougou', 'Boukaré Sankara', '+226 70 56 67 89', 'it@mairie-koud.bf', '192.168.150.0/24', 'VLAN350', true, false, true, true, false, true, false, true, false, false, false, 60, 'medium', 84, 18, 2, 62.0, 'active'),
  ('Université Thomas Sankara', 'direction', 'UTS', 'Campus', r_centre_ouest, 'Boulkiemdé', 'Koudougou', 12.2533, -2.0367, 'Campus Universitaire', 'Cheick Ouédraogo', '+226 70 67 78 90', 'it@uts.bf', '172.19.0.0/16', 'VLAN360', true, false, true, false, false, true, false, true, false, false, false, 50, 'high', 178, 35, 5, 55.0, 'active');

  -- Centre-Est (Tenkodogo)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Tenkodogo', 'mairie', 'MTE', 'Mairie', r_centre_est, 'Boulgou', 'Tenkodogo', 11.7833, -0.3667, 'Centre Tenkodogo', 'Nestor Compaoré', '+226 70 78 89 01', 'it@mairie-tenk.bf', '192.168.160.0/24', 'VLAN370', false, false, false, false, false, true, false, false, false, false, false, 28, 'critical', 38, 40, 5, 32.0, 'active');

  -- Centre-Nord (Kaya)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Kaya', 'mairie', 'MKA', 'Mairie', r_centre_nord, 'Sanmatenga', 'Kaya', 13.1667, -1.0833, 'Centre Kaya', 'Adama Ouédraogo', '+226 70 89 90 12', 'it@mairie-kaya.bf', '192.168.170.0/24', 'VLAN380', true, false, true, true, false, true, false, true, false, false, false, 56, 'medium', 72, 22, 3, 58.0, 'active'),
  ('Hôpital Régional de Kaya', 'direction', 'HRK', 'Direction', r_centre_nord, 'Sanmatenga', 'Kaya', 13.1700, -1.0867, 'Quartier de l''Hôpital', 'Dr. Sylvie Zongo', '+226 70 90 01 23', 'it@hrk.bf', '192.168.180.0/24', 'VLAN390', true, false, true, true, false, true, false, true, true, false, false, 64, 'medium', 88, 17, 2, 66.0, 'active');

  -- Centre-Sud (Manga)
  INSERT INTO sites (name, type, ministere, organisme, region_id, province, commune, latitude, longitude, address, resp_it_name, resp_it_phone, resp_it_email, ip_range, vlan, has_firewall, has_vpn, has_ad, has_backup, has_mfa, has_antivirus, has_edr, has_monitoring, has_updates, has_network_seg, has_cis_compliance, cyber_score, risk_level, equipment_count, vuln_count, incident_count, compliance_score, status) VALUES
  ('Mairie de Manga', 'mairie', 'MMA', 'Mairie', r_centre_sud, 'Zoundwéogo', 'Manga', 11.6667, -0.9833, 'Centre Manga', 'Florent Kaboré', '+226 70 01 12 34', 'it@mairie-manga.bf', '192.168.190.0/24', 'VLAN400', false, false, false, false, false, true, false, false, false, false, false, 26, 'critical', 33, 42, 6, 30.0, 'active');

END $$;

-- Connecteurs
INSERT INTO connectors (name, type, endpoint, is_active, status, sync_interval, config) VALUES
('GLPI Production', 'glpi', 'https://glpi.gov.bf/apirest.php', true, 'connected', 60, '{"api_token": "*****"}'),
('Wazuh Manager', 'wazuh', 'https://wazuh.gov.bf:55000', true, 'connected', 30, '{"user": "admin"}'),
('Nmap Scanner', 'nmap', 'https://nmap.gov.bf', true, 'connected', 360, '{"scan_type": "full"}'),
('Zabbix Server', 'zabbix', 'https://zabbix.gov.bf/api_jsonrpc.php', true, 'connected', 60, '{"api_token": "*****"}'),
('Nagios Core', 'nagios', 'https://nagios.gov.bf/cgi-bin', true, 'connected', 60, '{"api_key": "*****"}'),
('Graylog', 'graylog', 'https://graylog.gov.bf:9000/api', true, 'connected', 30, '{"token": "*****"}'),
('Prometheus', 'prometheus', 'https://prometheus.gov.bf:9090', true, 'connected', 15, '{}'),
('Grafana', 'grafana', 'https://grafana.gov.bf:3000', true, 'connected', 30, '{"api_key": "*****"}'),
('pfSense Firewall', 'pfsense', 'https://pfsense.gov.bf', true, 'connected', 60, '{"api_key": "*****"}'),
('Active Directory', 'ad', 'ldap://ad.gov.bf', true, 'connected', 60, '{"base_dn": "dc=gov,dc=bf"}'),
('OpenVAS Scanner', 'openvas', 'https://openvas.gov.bf:9392', true, 'connected', 720, '{"scan_config": "full"}'),
('Nessus Scanner', 'nessus', 'https://nessus.gov.bf:8834', false, 'disconnected', 720, '{}'),
('CrowdStrike Falcon', 'crowdstrike', 'https://api.crowdstrike.gov.bf', false, 'disconnected', 30, '{}'),
('Microsoft Defender', 'defender', 'https://api.securitycenter.microsoft.com', true, 'connected', 30, '{"tenant_id": "*****"}'),
('Suricata IDS', 'suricata', 'https://suricata.gov.bf', true, 'connected', 30, '{}'),
('OSQuery', 'osquery', 'https://osquery.gov.bf', true, 'connected', 60, '{}'),
('OCS Inventory', 'ocs', 'https://ocs.gov.bf/ocsreports', true, 'connected', 360, '{}'),
('Centreon', 'centreon', 'https://centreon.gov.bf/centreon/api', true, 'connected', 60, '{"token": "*****"}')
ON CONFLICT DO NOTHING;

-- Vulnérabilités CVE fictives
INSERT INTO vulnerabilities (cve_id, title, description, cvss_score, cvss_vector, severity, cwe, cpe, mitre_technique, epss_score, is_kev, published_date) VALUES
('CVE-2024-21412', 'Internet Shortcut Files Security Feature Bypass', 'Bypass de sécurité SmartScreen via fichiers .url', 8.1, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:H', 'high', 'CWE-693', 'cpe:2.3:a:microsoft:windows:*:*', 'T1566', 0.92340, true, '2024-02-13'),
('CVE-2024-21413', 'Outlook Remote Code Execution Vulnerability', 'RCE via emails spécialement conçus dans Outlook', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-94', 'cpe:2.3:a:microsoft:outlook:*:*', 'T1059', 0.95120, true, '2024-02-13'),
('CVE-2023-23397', 'Outlook Elevation of Privilege Vulnerability', 'Élévation de privilèges via NTLM leak', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-200', 'cpe:2.3:a:microsoft:outlook:*:*', 'T1552', 0.92100, true, '2023-03-14'),
('CVE-2024-3094', 'XZ Utils Backdoor', 'Backdoor dans xz-utils 5.6.0/5.6.1', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'critical', 'CWE-506', 'cpe:2.3:a:tukaani:xz:5.6.0:*:*', 'T1543', 0.98000, true, '2024-03-29'),
('CVE-2024-1086', 'Linux Kernel netfilter Use-After-Free', 'Use-after-free dans nf_tables', 7.8, 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', 'high', 'CWE-416', 'cpe:2.3:o:linux:kernel:*:*', 'T1068', 0.87500, true, '2024-01-31'),
('CVE-2023-46604', 'Apache ActiveMQ RCE', 'RCE via OpenWire protocol', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'critical', 'CWE-502', 'cpe:2.3:a:apache:activemq:*:*', 'T1059', 0.94500, true, '2023-10-27'),
('CVE-2024-23897', 'Jenkins Arbitrary File Read', 'Lecture arbitraire de fichiers via CLI', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-22', 'cpe:2.3:a:jenkins:jenkins:*:*', 'T1083', 0.93000, true, '2024-01-24'),
('CVE-2023-22515', 'Atlassian Confluence Privilege Escalation', 'Création unauthorized d''administrateurs', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-862', 'cpe:2.3:a:atlassian:confluence:*:*', 'T1078', 0.94000, true, '2023-10-04'),
('CVE-2024-21887', 'Ivanti Connect Secure Command Injection', 'Command injection dans le composant web', 9.1, 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H', 'critical', 'CWE-78', 'cpe:2.3:a:ivanti:connect_secure:*:*', 'T1059', 0.91800, true, '2024-01-10'),
('CVE-2023-4966', 'Citrix NetScaler Info Disclosure', 'Divulgation de mémoire sensible', 7.5, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', 'high', 'CWE-200', 'cpe:2.3:a:citrix:netscaler:*:*', 'T1552', 0.82000, false, '2023-10-10'),
('CVE-2024-0202', 'GoAnywhere MFT Authentication Bypass', 'Bypass d''authentification admin', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-287', 'cpe:2.3:a:fortra:goanywhere_mft:*:*', 'T1078', 0.91000, true, '2024-01-03'),
('CVE-2023-46805', 'Ivanti Connect Secure Auth Bypass', 'Bypass d''authentification', 8.2, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N', 'high', 'CWE-287', 'cpe:2.3:a:ivanti:connect_secure:*:*', 'T1078', 0.89000, true, '2023-12-10'),
('CVE-2024-27198', 'TeamCity Auth Bypass', 'Bypass d''authentification JetBrains TeamCity', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-287', 'cpe:2.3:a:jetbrains:teamcity:*:*', 'T1078', 0.93500, true, '2024-03-04'),
('CVE-2023-50164', 'Apache Struts Path Traversal', 'Path traversal dans file upload', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-22', 'cpe:2.3:a:apache:struts:*:*', 'T1190', 0.92500, true, '2023-12-07'),
('CVE-2024-6387', 'OpenSSH regreSSHion', 'Race condition dans sshd', 8.1, 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H', 'high', 'CWE-362', 'cpe:2.3:a:openbsd:openssh:*:*', 'T1190', 0.86000, true, '2024-07-01'),
('CVE-2023-4863', 'libwebp Heap Buffer Overflow', 'Heap overflow dans libwebp', 8.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 'high', 'CWE-787', 'cpe:2.3:a:webm:libwebp:*:*', 'T1068', 0.84000, true, '2023-09-12'),
('CVE-2024-38063', 'Windows TCP/IP RCE', 'RCE via IPv6 packets', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'critical', 'CWE-94', 'cpe:2.3:o:microsoft:windows:*:*', 'T1059', 0.95000, true, '2024-08-13'),
('CVE-2024-29988', 'Microsoft SmartScreen Bypass', 'Bypass Mark of the Web', 8.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 'high', 'CWE-693', 'cpe:2.3:a:microsoft:smartscreen:*:*', 'T1553', 0.87000, true, '2024-04-09'),
('CVE-2023-3530', 'Linux Kernel Use After Free in Netfilter', 'UAF dans nf_tables', 7.0, 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', 'high', 'CWE-416', 'cpe:2.3:o:linux:kernel:*:*', 'T1068', 0.81000, false, '2023-06-28'),
('CVE-2024-21762', 'FortiOS Out-of-Bound Write', 'Out-of-bound write dans SSL VPN', 9.6, 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H', 'critical', 'CWE-787', 'cpe:2.3:a:fortinet:fortios:*:*', 'T1190', 0.92000, true, '2024-02-08')
ON CONFLICT (cve_id) DO NOTHING;

-- Threat Intelligence
INSERT INTO threat_intel (type, value, description, source, threat_actor, mitre_technique, confidence, tlp, is_active) VALUES
('ip', '185.220.101.45', 'IP Tor exit node associée à APT29', 'MISP Feed', 'APT29', 'T1071', 85, 'amber', true),
('ip', '91.218.147.12', 'C2 server MuddyWater', 'AlienVault OTX', 'MuddyWater', 'T1071', 90, 'amber', true),
('domain', 'secure-update-microsoft.com', 'Phishing domain imitating Microsoft', 'PhishTank', 'FIN7', 'T1566', 95, 'red', true),
('domain', 'gov-bf-login.ml', 'Phishing domain targeting BF gov', 'Internal SOC', 'Unknown', 'T1566', 80, 'red', true),
('hash', 'a3f5d8e2b9c1f4e7d6a8b5c9e1f2d3a4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e', 'Ransomware LockBit 3.0 sample', 'VirusTotal', 'LockBit', 'T1486', 99, 'red', true),
('hash', 'b4e6f9a3c0d2e5f8a7b6c3d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f', 'Trojan Emotet loader', 'VirusTotal', 'Emotet', 'T1027', 97, 'red', true),
('url', 'http://malicious-site.tk/login.php', 'Credential harvesting URL', 'Internal SOC', 'Unknown', 'T1556', 88, 'amber', true),
('ioc', 'registry:HKLM\Software\Malware\Persistence', 'Registry persistence IOC', 'Wazuh SCA', 'Unknown', 'T1547', 75, 'amber', true),
('ip', '45.133.1.78', 'Brute force source SSH', 'Internal Wazuh', 'Unknown', 'T1110', 70, 'green', true),
('domain', 'fake-bceao.bf-login.net', 'Phishing BCEAO imitator', 'Internal SOC', 'Unknown', 'T1566', 92, 'red', true),
('ip', '194.165.16.78', 'Scanning activity Nmap detected', 'Suricata IDS', 'Unknown', 'T1046', 65, 'green', true),
('hash', 'c5f7a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', 'Cobalt Strike beacon', 'CrowdStrike', 'APT41', 'T1071', 99, 'red', true)
ON CONFLICT DO NOTHING;
