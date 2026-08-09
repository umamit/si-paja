import { DrainageSegment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldAlert, CheckCircle, Flame } from 'lucide-react';

interface StatsGridProps {
  segments: DrainageSegment[];
}

export function StatsGrid({ segments }: StatsGridProps) {
  const totalLength = segments.reduce((sum, seg) => sum + Number(seg.length_m), 0);
  const conditions = segments.reduce(
    (acc, seg) => {
      acc[seg.condition] = (acc[seg.condition] || 0) + 1;
      return acc;
    },
    { baik: 0, rusak_ringan: 0, rusak_berat: 0, tersumbat: 0 }
  );

  const stats = [
    {
      title: 'Total Panjang Terpetakan',
      value: `${(totalLength / 1000).toFixed(2)} km`,
      desc: `${segments.length} segmen terdaftar`,
      icon: Activity,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Saluran Kondisi Baik',
      value: `${conditions.baik} segmen`,
      desc: `${((conditions.baik / (segments.length || 1)) * 100).toFixed(0)}% dari total`,
      icon: CheckCircle,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Tersumbat / Sedimen',
      value: `${conditions.tersumbat} segmen`,
      desc: 'Memerlukan pembersihan',
      icon: Flame,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Rusak Berat',
      value: `${conditions.rusak_berat} segmen`,
      desc: 'Memerlukan rehabilitasi fisik',
      icon: ShieldAlert,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <div className={`p-2 rounded-lg border ${stat.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
