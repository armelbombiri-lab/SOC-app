import { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, Maximize2, Minimize2, Flame, X, MapPin, Route, Trash2, Ruler, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Site, Region } from '@/lib/types';
import { RISK_COLORS, SITE_TYPE_LABELS } from '@/lib/types';
import { scoreColor } from '@/lib/utils';

type HeatmapMode = 'none' | 'vulnerabilities' | 'incidents' | 'equipment' | 'critical';

const MIN_LON = -5.6;
const MAX_LON = 2.8;
const MIN_LAT = 9.35;
const MAX_LAT = 15.15;
const MAP_W = 820;
const MAP_H = 570;

const project = (lat: number, lon: number): [number, number] => {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_W;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_H;
  return [x, y];
};

const BF_BORDER = [
  [15.08, -2.83], [14.90, -0.25], [14.92, 1.20], [14.35, 1.80],
  [12.42, 2.69], [11.13, 2.69], [10.10, 1.85], [9.48, 0.50],
  [9.40, -0.95], [9.50, -2.50], [9.90, -4.00], [10.25, -5.15],
  [11.10, -5.45], [12.05, -4.50], [13.00, -3.10], [14.00, -2.85],
];

const BF_PATH = BF_BORDER.map(([lat, lon], i) => {
  const [x, y] = project(lat, lon);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ') + ' Z';

const REGION_CENTERS: Record<string, { lat: number; lon: number }> = {
  'Boucle du Mouhoun': { lat: 12.46, lon: -3.47 },
  'Cascades': { lat: 10.63, lon: -4.77 },
  'Centre': { lat: 12.37, lon: -1.53 },
  'Centre-Est': { lat: 11.78, lon: 0.37 },
  'Centre-Nord': { lat: 13.08, lon: -1.08 },
  'Centre-Ouest': { lat: 12.25, lon: -2.05 },
  'Centre-Sud': { lat: 11.67, lon: -1.27 },
  'Est': { lat: 12.06, lon: 0.37 },
  'Hauts-Bassins': { lat: 11.17, lon: -4.30 },
  'Nord': { lat: 13.58, lon: -2.36 },
  'Plateau-Central': { lat: 12.58, lon: -1.77 },
  'Sahel': { lat: 14.04, lon: -0.42 },
  'Sud-Ouest': { lat: 10.33, lon: -3.22 },
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function Cartography() {
  const [sites, setSites] = useState<Site[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', risk: 'all', region: 'all', minScore: 0 });
  const [drawMode, setDrawMode] = useState(false);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lon: number }[]>([]);
  const [hoveredSite, setHoveredSite] = useState<Site | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const [viewBox, setViewBox] = useState({ x: -40, y: -40, w: MAP_W + 80, h: MAP_H + 80 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panRef = useRef<{ startX: number; startY: number; vbx: number; vby: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [sitesRes, regionsRes] = await Promise.all([
        supabase.from('sites').select('*'),
        supabase.from('regions').select('*'),
      ]);
      setSites(sitesRes.data || []);
      setRegions(regionsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredSites = sites.filter((s) => {
    if (filters.type !== 'all' && s.type !== filters.type) return false;
    if (filters.risk !== 'all' && s.risk_level !== filters.risk) return false;
    if (filters.region !== 'all' && s.region_id !== filters.region) return false;
    if (s.cyber_score < filters.minScore) return false;
    return true;
  });

  const zoomBy = useCallback((factor: number, cx: number, cy: number) => {
    setViewBox((vb) => {
      const newW = Math.max(200, Math.min(MAP_W * 3, vb.w * factor));
      const newH = Math.max(140, Math.min(MAP_H * 3, vb.h * factor));
      const newX = cx - (cx - vb.x) * (newW / vb.w);
      const newY = cy - (cy - vb.y) * (newH / vb.h);
      return { x: newX, y: newY, w: newW, h: newH };
    });
  }, []);

  const handleZoomIn = () => {
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    zoomBy(0.7, cx, cy);
  };

  const handleZoomOut = () => {
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    zoomBy(1.4, cx, cy);
  };

  const handleResetView = () => {
    setViewBox({ x: -40, y: -40, w: MAP_W + 80, h: MAP_H + 80 });
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (drawMode || e.button !== 0) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, vbx: viewBox.x, vby: viewBox.y };
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (panRef.current) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scale = viewBox.w / rect.width;
      const dx = (e.clientX - panRef.current.startX) * scale;
      const dy = (e.clientY - panRef.current.startY) * scale;
      setViewBox((vb) => ({ ...vb, x: panRef.current!.vbx - dx, y: panRef.current!.vby - dy }));
    }
  };

  const handleSvgMouseUp = () => { panRef.current = null; };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!drawMode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = viewBox.w / rect.width;
    const svgX = viewBox.x + (e.clientX - rect.left) * scale;
    const svgY = viewBox.y + (e.clientY - rect.top) * scale;
    const lon = MIN_LON + (svgX / MAP_W) * (MAX_LON - MIN_LON);
    const lat = MAX_LAT - (svgY / MAP_H) * (MAX_LAT - MIN_LAT);
    setRoutePoints((prev) => [...prev, { lat, lon }]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = viewBox.w / rect.width;
    const cx = viewBox.x + (e.clientX - rect.left) * scale;
    const cy = viewBox.y + (e.clientY - rect.top) * scale;
    zoomBy(e.deltaY > 0 ? 1.15 : 0.87, cx, cy);
  };

  const clearRoute = () => {
    setRoutePoints([]);
  };

  const routeDistance = routePoints.length >= 2
    ? routePoints.reduce((sum, pt, i) => i === 0 ? 0 : sum + haversine(routePoints[i - 1].lat, routePoints[i - 1].lon, pt.lat, pt.lon), 0)
    : 0;

  const routeSvgPath = routePoints.length >= 2
    ? routePoints.map((pt, i) => { const [x, y] = project(pt.lat, pt.lon); return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' ')
    : '';

  const maxHeatWeight = Math.max(...filteredSites.map((s) => {
    if (heatmapMode === 'vulnerabilities') return s.vuln_count || 0;
    if (heatmapMode === 'incidents') return s.incident_count || 0;
    if (heatmapMode === 'equipment') return s.equipment_count || 0;
    if (heatmapMode === 'critical') return s.risk_level === 'critical' ? 100 : s.risk_level === 'high' ? 50 : 10;
    return 1;
  }), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartographie nationale</h1>
          <p className="text-sm text-slate-400">{filteredSites.length} sites affiches sur {sites.length} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:border-slate-700 transition-colors">
            <Filter className="w-4 h-4" /> Filtres
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:border-slate-700 transition-colors">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type de site</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="all">Tous</option>
              {Object.entries(SITE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Niveau de risque</label>
            <select value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="all">Tous</option>
              <option value="critical">Critique</option><option value="high">Haut</option><option value="medium">Moyen</option><option value="low">Faible</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Region</label>
            <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="all">Toutes</option>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Score cyber min: {filters.minScore}</label>
            <input type="range" min="0" max="100" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })} className="w-full accent-emerald-500" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Flame className="w-4 h-4" /> Heatmap:</div>
        {([
          { id: 'none', label: 'Aucune' }, { id: 'vulnerabilities', label: 'Vulnerabilites' },
          { id: 'incidents', label: 'Cyberattaques' }, { id: 'equipment', label: 'Equipements' },
          { id: 'critical', label: 'Systemes critiques' },
        ] as const).map((hm) => (
          <button key={hm.id} onClick={() => setHeatmapMode(hm.id as any)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${heatmapMode === hm.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {hm.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setDrawMode(!drawMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${drawMode ? 'bg-emerald-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'}`}>
          <Route className="w-4 h-4" /> {drawMode ? 'Cliquez sur la carte...' : 'Tracer un trajet'}
        </button>
        {routePoints.length > 0 && (
          <button onClick={clearRoute} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Effacer le trajet
          </button>
        )}
        {routeDistance > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300">
            <Ruler className="w-4 h-4 text-emerald-400" />
            Distance: <span className="font-bold text-white">{routeDistance < 1 ? `${Math.round(routeDistance * 1000)} m` : `${routeDistance.toFixed(1)} km`}</span>
            {' - '} {routePoints.length} points
          </div>
        )}
      </div>

      <div className={`relative ${fullscreen ? 'fixed inset-0 z-50' : ''} bg-slate-900 border border-slate-800 rounded-xl overflow-hidden`}>
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className={`w-full ${fullscreen ? 'h-screen' : 'h-[600px]'} ${drawMode ? 'cursor-crosshair' : panRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          onClick={handleSvgClick}
          onWheel={handleWheel}
        >
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect x={-100} y={-100} width={MAP_W + 200} height={MAP_H + 200} fill="url(#bgGlow)" />
          <rect x={-100} y={-100} width={MAP_W + 200} height={MAP_H + 200} fill="url(#grid)" opacity={0.3} />

          {/* Heatmap circles */}
          {heatmapMode !== 'none' && filteredSites.map((site) => {
            if (!site.latitude || !site.longitude) return null;
            const [x, y] = project(site.latitude, site.longitude);
            let weight = 1;
            if (heatmapMode === 'vulnerabilities') weight = site.vuln_count || 0;
            else if (heatmapMode === 'incidents') weight = site.incident_count || 0;
            else if (heatmapMode === 'equipment') weight = site.equipment_count || 0;
            else if (heatmapMode === 'critical') weight = site.risk_level === 'critical' ? 100 : site.risk_level === 'high' ? 50 : 10;
            const intensity = Math.min(weight / maxHeatWeight, 1);
            const r = 25 + intensity * 60;
            const fill = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f97316' : '#eab308';
            return <circle key={`heat-${site.id}`} cx={x} cy={y} r={r} fill={fill} opacity={0.18} style={{ pointerEvents: 'none' }} />;
          })}

          {/* Country border */}
          <path d={BF_PATH} fill="#0f172a" stroke="#1e3a5f" strokeWidth={2} />
          <path d={BF_PATH} fill="none" stroke="#2563eb" strokeWidth={1} opacity={0.3} />

          {/* Region labels */}
          {regions.map((r) => {
            const center = REGION_CENTERS[r.name];
            if (!center) return null;
            const [x, y] = project(center.lat, center.lon);
            return (
              <g key={r.id} style={{ pointerEvents: 'none' }}>
                <circle cx={x} cy={y} r={3} fill="#334155" />
                <text x={x + 7} y={y + 3} fill="#64748b" fontSize={9} fontWeight={500} className="select-none">
                  {r.name}
                </text>
              </g>
            );
          })}

          {/* Route line */}
          {routeSvgPath && (
            <path d={routeSvgPath} fill="none" stroke="#10b981" strokeWidth={3} strokeDasharray="10 8" opacity={0.85} filter="url(#glow)" style={{ pointerEvents: 'none' }} />
          )}

          {/* Route points */}
          {routePoints.map((pt, i) => {
            const [x, y] = project(pt.lat, pt.lon);
            const color = i === 0 ? '#22c55e' : i === routePoints.length - 1 ? '#ef4444' : '#3b82f6';
            return (
              <g key={`rp-${i}`} style={{ pointerEvents: 'none' }}>
                <circle cx={x} cy={y} r={6} fill={color} stroke="#fff" strokeWidth={2} />
                {i === 0 && <text x={x + 9} y={y - 5} fill="#22c55e" fontSize={10} fontWeight={600}>Depart</text>}
                {i === routePoints.length - 1 && i > 0 && <text x={x + 9} y={y - 5} fill="#ef4444" fontSize={10} fontWeight={600}>Arrivee</text>}
              </g>
            );
          })}

          {/* Site markers */}
          {filteredSites.map((site) => {
            if (!site.latitude || !site.longitude) return null;
            const [x, y] = project(site.latitude, site.longitude);
            const color = RISK_COLORS[site.risk_level];
            const isHovered = hoveredSite?.id === site.id;
            return (
              <g
                key={site.id}
                onMouseEnter={() => { setHoveredSite(site); if (svgRef.current) { const rect = svgRef.current.getBoundingClientRect(); const scale = viewBox.w / rect.width; setHoverPos({ x: x - viewBox.x, y: y - viewBox.y }); } }}
                onMouseLeave={() => setHoveredSite(null)}
                onClick={(e) => { e.stopPropagation(); setSelectedSite(site); }}
                style={{ cursor: 'pointer' }}
              >
                {(isHovered || heatmapMode === 'none') && (
                  <circle cx={x} cy={y} r={isHovered ? 14 : 10} fill={color} stroke="#fff" strokeWidth={1.5} opacity={isHovered ? 1 : 0.9} className="transition-all" />
                )}
                {isHovered && (
                  <circle cx={x} cy={y} r={20} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
          <button onClick={handleZoomIn} className="w-9 h-9 flex items-center justify-center bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="w-9 h-9 flex items-center justify-center bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetView} className="w-9 h-9 flex items-center justify-center bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {fullscreen && (
          <button onClick={() => setFullscreen(false)} className="absolute top-4 left-4 z-10 p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-3 space-y-1.5 z-10">
          <div className="text-xs font-semibold text-white mb-1">Legende</div>
          {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[level] }} />
              <span className="text-xs text-slate-300">
                {level === 'critical' ? 'Critique' : level === 'high' ? 'Haut' : level === 'medium' ? 'Moyen' : 'Faible'}
              </span>
            </div>
          ))}
        </div>

        {/* Title badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 z-10">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> Burkina Faso
          </div>
          <div className="text-xs text-slate-400">{filteredSites.length} sites - {regions.length} regions</div>
        </div>

        {/* Hover tooltip */}
        {hoveredSite && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 z-20 shadow-xl"
            style={{
              left: `${(hoverPos.x / viewBox.w) * 100}%`,
              top: `${(hoverPos.y / viewBox.h) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <div className="text-sm font-semibold text-white">{hoveredSite.name}</div>
            <div className="text-xs text-slate-400">
              Score: <span style={{ color: scoreColor(hoveredSite.cyber_score) }}>{hoveredSite.cyber_score}/100</span>
              {' - '}{hoveredSite.vuln_count} vuln.
            </div>
          </div>
        )}
      </div>

      {selectedSite && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setSelectedSite(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSite.name}</h2>
                <p className="text-sm text-slate-400">{SITE_TYPE_LABELS[selectedSite.type]} - {selectedSite.ministere || '-'}</p>
              </div>
              <button onClick={() => setSelectedSite(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Score cyber</div>
                <div className="text-2xl font-bold" style={{ color: scoreColor(selectedSite.cyber_score) }}>{selectedSite.cyber_score}/100</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Niveau de risque</div>
                <div className="text-2xl font-bold capitalize" style={{ color: RISK_COLORS[selectedSite.risk_level] }}>
                  {selectedSite.risk_level === 'critical' ? 'Critique' : selectedSite.risk_level === 'high' ? 'Haut' : selectedSite.risk_level === 'medium' ? 'Moyen' : 'Faible'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-white">{selectedSite.equipment_count}</div><div className="text-xs text-slate-400">Equipements</div></div>
              <div className="text-center bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-orange-400">{selectedSite.vuln_count}</div><div className="text-xs text-slate-400">Vulnerabilites</div></div>
              <div className="text-center bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-red-400">{selectedSite.incident_count}</div><div className="text-xs text-slate-400">Incidents</div></div>
            </div>
            <div className="space-y-2 text-sm">
              <InfoRow label="Region" value={regions.find((r) => r.id === selectedSite.region_id)?.name || '-'} />
              <InfoRow label="Province" value={selectedSite.province || '-'} />
              <InfoRow label="Commune" value={selectedSite.commune || '-'} />
              <InfoRow label="Adresse" value={selectedSite.address || '-'} />
              <InfoRow label="GPS" value={`${selectedSite.latitude}, ${selectedSite.longitude}`} />
              <InfoRow label="Plage IP" value={selectedSite.ip_range || '-'} />
              <InfoRow label="VLAN" value={selectedSite.vlan || '-'} />
              <InfoRow label="Resp. IT" value={selectedSite.resp_it_name || '-'} />
              <InfoRow label="Telephone" value={selectedSite.resp_it_phone || '-'} />
              <InfoRow label="Email" value={selectedSite.resp_it_email || '-'} />
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-400 mb-2">Mesures de securite</div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'has_firewall', label: 'Pare-feu' }, { key: 'has_vpn', label: 'VPN' }, { key: 'has_ad', label: 'AD' },
                  { key: 'has_backup', label: 'Sauvegardes' }, { key: 'has_mfa', label: 'MFA' }, { key: 'has_antivirus', label: 'Antivirus' },
                  { key: 'has_edr', label: 'EDR' }, { key: 'has_monitoring', label: 'Supervision' }, { key: 'has_updates', label: 'MAJ' },
                  { key: 'has_network_seg', label: 'Segmentation' }, { key: 'has_cis_compliance', label: 'CIS' },
                ] as const).map((m) => (
                  <span key={m.key} className={`text-xs px-2 py-1 rounded-md ${(selectedSite as any)[m.key] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-800/50">
      <span className="text-slate-400">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}
