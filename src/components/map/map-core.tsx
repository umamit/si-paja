'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, Circle } from 'react-leaflet';
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

interface MapCoreProps {
  segments: DrainageSegment[];
}

const floodHotspots = [
  { center: [-1.9455, 124.3770] as [number, number], radius: 140, desc: 'Hotspot Genangan Jl. Sultan Hasanuddin' },
  { center: [-1.9475, 124.3800] as [number, number], radius: 100, desc: 'Hotspot Genangan Area Pelabuhan Bobong' },
];

export function MapCore({ segments }: MapCoreProps) {
  const [showHotspots, setShowHotspots] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
  }, []);

  const centerLat = -1.9450;
  const centerLng = 124.3790;

  const conditionColors: Record<string, string> = {
    baik: '#10b981',
    rusak_ringan: '#f59e0b',
    rusak_berat: '#ef4444',
    tersumbat: '#f97316',
  };

  const conditionLabels: Record<string, string> = {
    baik: 'Baik',
    rusak_ringan: 'Rusak Ringan',
    rusak_berat: 'Rusak Berat',
    tersumbat: 'Tersumbat',
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
      {/* Flood Hotspots Layer Toggle */}
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

        {showHotspots && floodHotspots.map((h, i) => (
          <Circle
            key={i}
            center={h.center}
            radius={h.radius}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 1.5 }}
          >
            <Popup><span className="font-bold text-xs text-rose-800">{h.desc}</span></Popup>
          </Circle>
        ))}

        {segments.map((seg) => {
          const positions: [number, number][] = [
            [seg.start_lat, seg.start_lng],
            [seg.end_lat, seg.end_lng],
          ];
          const isProposed = seg.category === 'proposed';
          const isMissing = seg.material === 'belum_ada';
          const color = isProposed ? '#a855f7' : (isMissing ? '#ef4444' : (conditionColors[seg.condition] || '#64748b'));
          const dashArray = isProposed ? '5, 8' : (isMissing ? '8, 8' : undefined);

          return (
            <div key={seg.id}>
              <Polyline positions={positions} pathOptions={{ color, weight: 6, opacity: 0.8, dashArray }}>
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">{seg.name}</h4>
                    <div className="flex gap-2">
                      <Badge className="text-[10px] text-white" style={{ backgroundColor: color }}>
                        {isProposed ? 'Proposed/Rencana' : conditionLabels[seg.condition]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {seg.material.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <p><strong>Panjang:</strong> {seg.length_m} m | <strong>Kemiringan:</strong> {Math.abs((seg.start_elevation_m || 0) - (seg.end_elevation_m || 0))} m</p>
                    </div>
                  </div>
                </Popup>
              </Polyline>
              <Marker position={[seg.start_lat, seg.start_lng]} />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
export default MapCore;
