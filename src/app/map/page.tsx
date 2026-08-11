'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { DrainageSegment } from '@/types';
import { AppLayout } from '@/components/shared/layout';
import { MapContainer } from '@/components/map/map-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';

export default function MapPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<DrainageSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((prof) => {
        if (!prof) {
          router.push('/');
          return;
        }
        return getSegments();
      })
      .then((data) => {
        if (data) setSegments(data);
      })
      .catch((err) => {
        console.error(err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Peta GIS Drainase Bobong</h2>
          <p className="text-sm text-slate-500">
            Pemetaan spasial jaringan drainase berdasarkan koordinat fisik dan kondisi lapangan.
          </p>
        </div>

        <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 bg-slate-50 border-b">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>Peta Kota Bobong</span>
              <div className="flex flex-col lg:flex-row lg:items-center gap-x-5 gap-y-2 text-xs font-normal">
                {/* Legend Kondisi Fisik */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Kondisi:</span>
                  <span className="flex items-center gap-1.25"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />Baik</span>
                  <span className="flex items-center gap-1.25"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />R. Ringan</span>
                  <span className="flex items-center gap-1.25"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />R. Berat</span>
                  <span className="flex items-center gap-1.25"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />Tersumbat</span>
                  <span className="flex items-center gap-1.25"><span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#a855f7] bg-[#a855f7]/20" />Rencana</span>
                </div>
                {/* Pembatas / Divider */}
                <div className="hidden lg:block h-3.5 w-[1px] bg-slate-200" />
                {/* Legend Klasifikasi Saluran */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-slate-500">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Tipe:</span>
                  <span className="flex items-center gap-1.5"><span className="h-[5px] w-4 bg-slate-500 rounded-sm" />Primer (≥150cm)</span>
                  <span className="flex items-center gap-1.5"><span className="h-[3px] w-4 bg-slate-500 rounded-sm" />Sekunder (50-149cm)</span>
                  <span className="flex items-center gap-1.5"><span className="h-[1.5px] w-4 bg-slate-500 rounded-sm" />Tersier (&lt;50cm)</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MapContainer segments={segments} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
export { MapPage };
