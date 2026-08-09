'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { DrainageSegment } from '@/types';
import { AppLayout } from '@/components/shared/layout';
import { MapContainer } from '@/components/map/map-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Memuat peta GIS...</p>
        </div>
      </div>
    );
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
              <div className="flex items-center space-x-4 text-xs font-normal">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />Baik</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />Rusak Ringan</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />Rusak Berat</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />Tersumbat</span>
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
