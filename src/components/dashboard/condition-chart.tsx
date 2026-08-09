'use client';

import { DrainageSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ConditionChartProps {
  segments: DrainageSegment[];
}

export function ConditionChart({ segments }: ConditionChartProps) {
  const counts = segments.reduce(
    (acc, seg) => {
      acc[seg.condition] = (acc[seg.condition] || 0) + 1;
      return acc;
    },
    { baik: 0, rusak_ringan: 0, rusak_berat: 0, tersumbat: 0 }
  );

  const data = [
    { name: 'Baik', value: counts.baik, color: '#10b981' },
    { name: 'Rusak Ringan', value: counts.rusak_ringan, color: '#fbbf24' },
    { name: 'Rusak Berat', value: counts.rusak_berat, color: '#f43f5e' },
    { name: 'Tersumbat', value: counts.tersumbat, color: '#f97316' },
  ].filter((item) => item.value > 0);

  const isEmpty = data.length === 0;

  return (
    <Card className="border border-slate-100 shadow-sm col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Kondisi Fisik Drainase
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex flex-col items-center justify-center">
        {isEmpty ? (
          <p className="text-sm text-slate-400">Tidak ada data kondisi untuk ditampilkan.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
export default ConditionChart;
