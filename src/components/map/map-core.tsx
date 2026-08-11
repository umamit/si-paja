'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DrainageSegment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useFlowRouting, EnrichedSegment } from '@/hooks/use-flow-routing';

import { fixLeafletIcon, conditionColors, conditionLabels, centerLat, centerLng } from './map-utils';

interface MapCoreProps { segments: DrainageSegment[]; }

export function MapCore({ segments }: MapCoreProps) {
  const [showHotspots, setShowHotspots] = useState(false);
  const [showFlowRouting, setShowFlowRouting] = useState(false);
  const [rainIntensity, setRainIntensity] = useState(110);

  useEffect(() => {
    fixLeafletIcon();
    setRainIntensity(Number(localStorage.getItem('pupr_rain_intensity')) || 110);
  }, []);

  const routedSegments = useFlowRouting(segments, rainIntensity);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
      <div className="absolute top-4 right-4 z-[9999] bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-3 shadow-md space-y-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
          <input type="checkbox" checked={showHotspots} onChange={(e) => { setShowHotspots(e.target.checked); if (e.target.checked) setShowFlowRouting(false); }} className="accent-emerald-600 h-3.5 w-3.5" />
          Zona Rawan Banjir (Lokal)
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
          <input type="checkbox" checked={showFlowRouting} onChange={(e) => { setShowFlowRouting(e.target.checked); if (e.target.checked) setShowHotspots(false); }} className="accent-blue-600 h-3.5 w-3.5" />
          Simulasi Aliran Air (Routing)
        </label>
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {showHotspots && segments.map((seg) => {
          const elevStart = seg.start_elevation_m ?? 0, elevEnd = seg.end_elevation_m ?? 0, dElev = elevStart - elevEnd;
          const slope = seg.length_m > 0 ? (Math.abs(dElev) / seg.length_m) * 100 : 0;
          const C = { beton_precast: 0.85, pasangan_batu: 0.75, tanah: 0.50, belum_ada: 0.90, lainnya: 0.70 }[seg.material] || 0.7;
          const Q_r = 0.278 * C * rainIntensity * ((seg.length_m * 15) / 1000000), Q_m = 0.85 * ((seg.width_cm / 100) * (seg.depth_cm / 100));
          const reasons = [
            (seg.condition === 'tersumbat' || seg.condition === 'rusak_berat') && (seg.condition === 'tersumbat' ? 'Saluran Tersumbat' : 'Kerusakan Fisik Berat'),
            Q_r > Q_m && 'Debit Limpasan Melebihi Kapasitas (Luapan)',
            dElev < 0 && 'Aliran Terbalik (Mendaki)',
            slope < 0.05 && seg.length_m > 0 && 'Kemiringan Sangat Datar (<0.05%)'
          ].filter(Boolean) as string[];
          if (reasons.length < 2) return null;

          return (
            <Circle key={`hotspot-${seg.id}`} center={[(seg.start_lat + seg.end_lat) / 2, (seg.start_lng + seg.end_lng) / 2]} radius={Math.max(seg.length_m / 2, 40)} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 1.5 }}>
              <Popup>
                <div className="p-1 space-y-1.5 max-w-xs text-xs text-slate-850">
                  <h4 className="font-bold text-rose-800 border-b pb-1">⚠️ ZONA RAWAN BANJIR (LOKAL)</h4>
                  <p className="font-semibold text-slate-900">{seg.name}</p>
                  <div className="space-y-1 text-[10px]">
                    <p className="font-bold text-slate-550 uppercase">Penyebab:</p>
                    <ul className="list-disc pl-3.5 space-y-0.5 text-rose-700 font-semibold leading-normal">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {showFlowRouting && routedSegments.filter(s => s.isBottleneck).map((seg) => (
          <Circle key={`bottleneck-${seg.id}`} center={[(seg.start_lat + seg.end_lat) / 2, (seg.start_lng + seg.end_lng) / 2]} radius={Math.max(seg.length_m / 2, 40)} pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.3, weight: 2, dashArray: '4, 4' }}>
            <Popup>
              <div className="p-1 space-y-1.5 max-w-xs text-xs text-slate-850">
                <h4 className="font-bold text-red-650 border-b pb-1">⚠️ BOTTLENECK ALIRAN JARINGAN</h4>
                <p className="font-semibold text-slate-900">{seg.name}</p>
                <div className="text-[10px] space-y-1 leading-normal text-slate-650">
                  <p>Parit hilir ini tidak sanggup menampung debit kumulatif air kiriman dari hulu!</p>
                  <p><strong>Beban Air Kumulatif:</strong> <span className="font-mono text-red-650 font-bold">{seg.Q_total.toFixed(4)} m³/s</span></p>
                  <p><strong>Kapasitas Parit (Qmax):</strong> <span className="font-mono font-semibold">{seg.Q_max.toFixed(4)} m³/s</span></p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {(showFlowRouting ? routedSegments : (segments as EnrichedSegment[])).map((seg) => {
          const positions: [number, number][] = seg.path_coordinates && seg.path_coordinates.length > 0
            ? seg.path_coordinates
            : [[seg.start_lat, seg.start_lng], [seg.end_lat, seg.end_lng]];
          const isProposed = seg.category === 'proposed';
          const isMissing = seg.material === 'belum_ada';
          
          let color = isProposed ? '#a855f7' : (isMissing ? '#ef4444' : (conditionColors[seg.condition] || '#64748b'));
          let weight = seg.width_cm >= 150 ? 6.0 : (seg.width_cm >= 50 ? 4.0 : 2.5);

          if (showFlowRouting) {
            color = seg.Q_total < 0.05 ? '#38bdf8' : (seg.Q_total < 0.2 ? '#0284c7' : '#1e1b4b');
            weight = seg.Q_total < 0.05 ? 3 : (seg.Q_total < 0.2 ? 5.5 : 8);
          }

          const dashArray = isProposed ? '5, 8' : (isMissing ? '8, 8' : undefined);
          const typeLabel = seg.width_cm >= 150 ? 'Primer' : (seg.width_cm >= 50 ? 'Sekunder' : 'Tersier');

          return (
            <Polyline key={seg.id} positions={positions} pathOptions={{ color, weight, opacity: 0.8, dashArray }}>
              <Popup>
                <div className="p-1 space-y-2 max-w-xs animate-fade-in text-slate-850">
                  <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">{seg.name}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="text-[10px] text-white font-semibold" style={{ backgroundColor: showFlowRouting ? color : (isProposed ? '#a855f7' : (isMissing ? '#ef4444' : color)) }}>
                      {showFlowRouting ? `Debit: ${seg.Q_total.toFixed(3)} m³/s` : (isProposed ? 'Rencana' : conditionLabels[seg.condition])}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200">{typeLabel}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{seg.material.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-650 space-y-0.5 leading-normal">
                    <p><strong>Dimensi parit:</strong> L {seg.width_cm} cm | D {seg.depth_cm} cm</p>
                    {showFlowRouting ? (
                      <>
                        <p><strong>Q Lokal parit:</strong> <span className="font-mono">{seg.Q_lokal.toFixed(4)} m³/s</span></p>
                        <p><strong>Q Maks parit:</strong> <span className="font-mono">{seg.Q_max.toFixed(4)} m³/s</span></p>
                      </>
                    ) : (
                      <p><strong>Panjang:</strong> {seg.length_m} m | <strong>Beda Elevasi:</strong> {Math.abs((seg.start_elevation_m || 0) - (seg.end_elevation_m || 0))} m</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        <MarkerClusterGroup>
          {segments.map((seg) => {
            const isRev = (seg.start_elevation_m ?? 0) < (seg.end_elevation_m ?? 0);
            const p = seg.path_coordinates;
            const pos: [number, number] = p && p.length > 0
              ? (isRev ? p[p.length - 1] : p[0])
              : (isRev ? [seg.end_lat, seg.end_lng] : [seg.start_lat, seg.start_lng]);
            return <Marker key={`marker-${seg.id}`} position={pos} />;
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
export default MapCore;
