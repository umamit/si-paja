'use client';

import dynamic from 'next/dynamic';
import { DrainageSegment } from '@/types';

const DynamicMap = dynamic(() => import('./map-core'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
        <p className="text-sm text-slate-500">Memuat peta GIS Bobong...</p>
      </div>
    </div>
  ),
});

interface MapContainerProps {
  segments: DrainageSegment[];
}

export function MapContainer({ segments }: MapContainerProps) {
  return (
    <div className="w-full h-[550px] relative">
      <DynamicMap segments={segments} />
    </div>
  );
}
export default MapContainer;
