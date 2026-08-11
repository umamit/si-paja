'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navigation, Mountain } from 'lucide-react';

interface CoordInputProps {
  type: 'start' | 'end';
  lat: string;
  lng: string;
  elev: number | null;
  fetching: boolean;
  onChangeLat: (v: string) => void;
  onChangeLng: (v: string) => void;
  onBlur: () => void;
  onGps: () => void;
}

export function CoordInput({ type, lat, lng, elev, fetching, onChangeLat, onChangeLng, onBlur, onGps }: CoordInputProps) {
  const label = type === 'start' ? 'Koordinat Start' : 'Koordinat End';
  return (
    <div className="space-y-2 border border-slate-150 p-2.5 rounded-xl bg-slate-50/50">
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-600 text-xs">{label}</span>
        <Button type="button" size="sm" variant="outline" className="h-6.5 text-[9px] font-bold uppercase" onClick={onGps}>
          <Navigation className="h-3 w-3 mr-1" />Ambil GPS
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder={`${type === 'start' ? 'Start' : 'End'} Lat`} type="number" step="any"
          value={lat} onChange={(e) => onChangeLat(e.target.value)} onBlur={onBlur} className="h-8.5 bg-white" required />
        <Input placeholder={`${type === 'start' ? 'Start' : 'End'} Lng`} type="number" step="any"
          value={lng} onChange={(e) => onChangeLng(e.target.value)} onBlur={onBlur} className="h-8.5 bg-white" required />
      </div>
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700">
        <Mountain className="h-3 w-3" />
        {fetching ? <span className="text-slate-400">Mengambil elevasi DEM...</span>
          : elev !== null ? <span>Elevasi DEM: {elev} m dpl</span>
          : <span className="text-slate-400">Elevasi terisi otomatis saat koordinat dimasukkan</span>}
      </div>
    </div>
  );
}
