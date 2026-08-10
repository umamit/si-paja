'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DrainageSegment } from '@/types';
import { Badge } from '@/components/ui/badge';

const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface MapCoreProps { segments: DrainageSegment[]; }

export function MapCore({ segments }: MapCoreProps) {
  const [showHotspots, setShowHotspots] = useState(false);
  const [rainIntensity, setRainIntensity] = useState(110);

  useEffect(() => {
    fixLeafletIcon();
    if (typeof window !== 'undefined') setRainIntensity(Number(localStorage.getItem('pupr_rain_intensity')) || 110);
  }, []);

  const centerLat = -1.9450;
  const centerLng = 124.3790;
  const conditionColors: Record<string, string> = { baik: '#10b981', rusak_ringan: '#f59e0b', rusak_berat: '#ef4444', tersumbat: '#f97316' };
  const conditionLabels: Record<string, string> = { baik: 'Baik', rusak_ringan: 'Rusak Ringan', rusak_berat: 'Rusak Berat', tersumbat: 'Tersumbat' };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
      <div className="absolute top-4 right-4 z-[9999] bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input type="checkbox" checked={showHotspots} onChange={(e) => setShowHotspots(e.target.checked)} className="accent-emerald-600 h-3.5 w-3.5" />
          Tampilkan Zona Rawan Banjir
        </label>
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showHotspots && segments.map((seg) => {
          const elevStart = seg.start_elevation_m ?? 0, elevEnd = seg.end_elevation_m ?? 0, dElev = elevStart - elevEnd;
          const slope = seg.length_m > 0 ? (Math.abs(dElev) / seg.length_m) * 100 : 0;
          const C = { beton_precast: 0.85, pasangan_batu: 0.75, tanah: 0.50, belum_ada: 0.90, lainnya: 0.70 }[seg.material] || 0.7;
          const Q_r = 0.278 * C * rainIntensity * ((seg.length_m * 15) / 1000000), Q_m = 0.85 * ((seg.width_cm / 100) * (seg.depth_cm / 100));
          
          const reasons = [
            (seg.condition === 'tersumbat' || seg.condition === 'rusak_berat') && (seg.condition === 'tersumbat' ? 'Saluran Tersumbat' : 'Kerusakan Fisik Berat'),
            Q_r > Q_m && 'Debit Limpasan Melebihi Kapasitas (Luapan)',
            dElev < 0 && 'Aliran Terbalik (Mendaki)',
            slope < 0.1 && seg.length_m > 0 && 'Kemiringan Kritis / Sangat Datar (<0.1%)'
          ].filter(Boolean) as string[];

          if (reasons.length === 0) return null;

          return (
            <Circle
              key={`hotspot-${seg.id}`}
              center={[(seg.start_lat + seg.end_lat) / 2, (seg.start_lng + seg.end_lng) / 2]}
              radius={Math.max(seg.length_m / 2, 40)}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 1.5 }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 max-w-xs text-xs text-slate-850">
                  <h4 className="font-bold text-rose-800 border-b pb-1">⚠️ ZONA RAWAN BANJIR</h4>
                  <p className="font-semibold text-slate-900">{seg.name}</p>
                  <div className="space-y-1 text-[10px]">
                    <p className="font-bold text-slate-550 uppercase">Penyebab:</p>
                    <ul className="list-disc pl-3.5 space-y-0.5 text-rose-700 font-semibold leading-normal">
                      {reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {segments.map((seg) => {
          const positions: [number, number][] = [[seg.start_lat, seg.start_lng], [seg.end_lat, seg.end_lng]];
          const isProposed = seg.category === 'proposed';
          const isMissing = seg.material === 'belum_ada';
          const color = isProposed ? '#a855f7' : (isMissing ? '#ef4444' : (conditionColors[seg.condition] || '#64748b'));
          const dashArray = isProposed ? '5, 8' : (isMissing ? '8, 8' : undefined);

          const getDrainageType = (w: number) => {
            if (w >= 150) return 'Primer';
            if (w >= 50) return 'Sekunder';
            return 'Tersier';
          };
          const getLineWeight = (w: number) => {
            if (w >= 150) return 6.0;
            if (w >= 50) return 4.0;
            return 2.5;
          };

          const typeLabel = getDrainageType(seg.width_cm);
          const weight = getLineWeight(seg.width_cm);

          return (
            <Polyline key={seg.id} positions={positions} pathOptions={{ color, weight, opacity: 0.8, dashArray }}>
              <Popup>
                <div className="p-1 space-y-2 max-w-xs animate-fade-in">
                  <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">{seg.name}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="text-[10px] text-white font-semibold" style={{ backgroundColor: color }}>
                      {isProposed ? 'Rencana' : conditionLabels[seg.condition]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
                      {typeLabel}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {seg.material.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-650 space-y-0.5">
                    <p><strong>Dimensi:</strong> L {seg.width_cm} cm | D {seg.depth_cm} cm</p>
                    <p><strong>Panjang:</strong> {seg.length_m} m | <strong>Elevasi:</strong> {Math.abs((seg.start_elevation_m || 0) - (seg.end_elevation_m || 0))} m</p>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        <MarkerClusterGroup>
          {segments.map((seg) => (
            <Marker key={`marker-${seg.id}`} position={[seg.start_lat, seg.start_lng]} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
export default MapCore;
