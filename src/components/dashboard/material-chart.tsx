'use client';

import { DrainageSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MaterialChartProps {
  segments: DrainageSegment[];
}

export function MaterialChart({ segments }: MaterialChartProps) {
  const counts = segments.reduce(
    (acc, seg) => {
      acc[seg.material] = (acc[seg.material] || 0) + 1;
      return acc;
    },
    { pasangan_batu: 0, beton_precast: 0, tanah: 0, belum_ada: 0, lainnya: 0 }
  );

  const rawData = [
    { key: 'pasangan_batu', label: 'Batu Kali', count: counts.pasangan_batu, color: '#64748b' },
    { key: 'beton_precast', label: 'Beton Precast', count: counts.beton_precast, color: '#3b82f6' },
    { key: 'tanah', label: 'Tanah/Galian', count: counts.tanah, color: '#b45309' },
    { key: 'belum_ada', label: 'Belum Ada', count: counts.belum_ada, color: '#ef4444' },
    { key: 'lainnya', label: 'Lainnya', count: counts.lainnya, color: '#94a3b8' },
  ];

  const data = rawData.filter((item) => item.count > 0);
  const isEmpty = data.length === 0;

  return (
    <Card className="border border-slate-100 shadow-sm col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Distribusi Tipe Material
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex flex-col items-center justify-center">
        {isEmpty ? (
          <p className="text-sm text-slate-400">Tidak ada data material untuk ditampilkan.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
export default MaterialChart;
