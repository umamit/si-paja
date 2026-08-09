'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { DrainageSegment, Profile } from '@/types';
import { AppLayout } from '@/components/shared/layout';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { ConditionChart } from '@/components/dashboard/condition-chart';
import { MaterialChart } from '@/components/dashboard/material-chart';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';
import { Button } from '@/components/ui/button';
import { Map, ListPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [segments, setSegments] = useState<DrainageSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((prof) => {
        if (!prof) {
          router.push('/');
          return;
        }
        setProfile(prof);
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
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview SIG Drainase</h2>
            <p className="text-sm text-slate-500">
              Selamat datang kembali, {profile?.full_name || 'Surveyor'}. Berikut ringkasan survei Bobong.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/map">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Map className="h-4 w-4" />Lihat Peta
              </Button>
            </Link>
            <Link href="/segments">
              <Button variant="outline" className="gap-2 bg-white">
                <ListPlus className="h-4 w-4" />Kelola Segmen
              </Button>
            </Link>
          </div>
        </div>

        <StatsGrid segments={segments} />

        <div className="grid gap-6 md:grid-cols-2">
          <ConditionChart segments={segments} />
          <MaterialChart segments={segments} />
        </div>
      </div>
    </AppLayout>
  );
}
