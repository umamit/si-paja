'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DrainageSegment } from '@/types';
import { Badge } from '@/components/ui/badge';

// Fix Leaflet marker icons in Next.js
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

const conditionColors: Record<string, string> = {
  baik: '#10b981',
  rusak_ringan: '#fbbf24',
  rusak_berat: '#f43f5e',
  tersumbat: '#f97316',
};

const conditionLabels: Record<string, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_berat: 'Rusak Berat',
  tersumbat: 'Tersumbat',
};

export default function MapCore({ segments }: MapCoreProps) {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Pusat Peta Kota Bobong, Pulau Taliabu
  const centerLat = -1.8795;
  const centerLng = 124.4815;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {segments.map((seg) => {
          const positions: [number, number][] = [
            [seg.start_lat, seg.start_lng],
            [seg.end_lat, seg.end_lng],
          ];
          const isMissing = seg.material === 'belum_ada';
          const color = isMissing ? '#ef4444' : (conditionColors[seg.condition] || '#64748b');
          const dashArray = isMissing ? '8, 8' : undefined;

          return (
            <div key={seg.id}>
              {/* Draw polyline representing the drainage segment */}
              <Polyline
                positions={positions}
                pathOptions={{ color, weight: 6, opacity: 0.8, dashArray }}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">{seg.name}</h4>
                    <div className="flex gap-2">
                      <Badge style={{ backgroundColor: color, color: '#fff' }} className="text-[10px] px-2 py-0.5">
                        {conditionLabels[seg.condition]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize px-2 py-0.5">
                        {seg.material.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p><strong>Panjang:</strong> {seg.length_m} m</p>
                      <p><strong>Lebar:</strong> {seg.width_cm} cm</p>
                      <p><strong>Kedalaman:</strong> {seg.depth_cm} cm</p>
                    </div>
                    {seg.photo_url && (
                      <div className="mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={seg.photo_url}
                          alt={seg.name}
                          className="w-full h-20 object-cover rounded border border-slate-100"
                        />
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>

              {/* Renders start and end coordinates as markers */}
              <Marker position={[seg.start_lat, seg.start_lng]} />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
export { MapCore };
