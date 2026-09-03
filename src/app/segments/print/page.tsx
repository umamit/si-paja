'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { DrainageSegment } from '@/types';
import { PrintHeader } from '@/components/segments/print-header';
import { PrintFilter } from '@/components/segments/print-filter';
import { PrintTable } from '@/components/segments/print-table';
import { Loader2 } from 'lucide-react';

function PrintReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [segments, setSegments] = useState<DrainageSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoad, setSelectedRoad] = useState<string>('ALL');

  useEffect(() => {
    const roadQuery = searchParams.get('road');
    if (roadQuery) setSelectedRoad(roadQuery);
  }, [searchParams]);

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

  // SHS Rates for RAB
  const [rates, setRates] = useState({ cleaning: 120000, majorRepair: 2200000, minorRepair: 850000 });
  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('pupr_shs');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setRates({ cleaning: Number(p.cleaning) || 120000, majorRepair: Number(p.majorRepair) || 2200000, minorRepair: Number(p.minorRepair) || 850000 });
      } catch (e) {}
    }
  }, []);

  // Extract unique road names
  const roads = useMemo(() => {
    const set = new Set<string>();
    segments.forEach((s) => {
      const roadName = s.name.split('-')[0].trim();
      if (roadName) set.add(roadName);
    });
    return Array.from(set).sort();
  }, [segments]);

  // Filter segments by selected road
  const filteredSegments = useMemo(() => {
    if (selectedRoad === 'ALL') return segments;
    return segments.filter((s) => s.name.toLowerCase().includes(selectedRoad.toLowerCase()));
  }, [segments, selectedRoad]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8 text-slate-800 font-sans max-w-5xl mx-auto">
      <PrintFilter
        roads={roads}
        selectedRoad={selectedRoad}
        onSelectRoad={setSelectedRoad}
        filteredSegments={filteredSegments}
      />
      <PrintHeader selectedRoad={selectedRoad} />
      <PrintTable segments={filteredSegments} rates={rates} />
    </div>
  );
}

export default function PrintReportPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>}>
      <PrintReportContent />
    </Suspense>
  );
}
