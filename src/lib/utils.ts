import type { Site } from './types';

export function calculateCyberScore(site: Partial<Site>): number {
  let score = 0;
  if (site.has_ad) score += 20;
  if (site.has_firewall) score += 15;
  if (site.has_network_seg) score += 10;
  if (site.has_backup) score += 10;
  if (site.has_mfa) score += 10;
  if (site.has_antivirus) score += 10;
  if (site.has_edr) score += 10;
  if (site.has_monitoring) score += 5;
  if (site.has_updates) score += 5;
  if (site.has_cis_compliance) score += 5;
  return Math.min(score, 100);
}

export function riskLevelFromScore(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score < 30) return 'critical';
  if (score < 50) return 'high';
  if (score < 75) return 'medium';
  return 'low';
}

export function scoreColor(score: number): string {
  if (score < 30) return '#ef4444';
  if (score < 50) return '#f97316';
  if (score < 75) return '#eab308';
  return '#22c55e';
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  return `il y a ${months}mois`;
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
