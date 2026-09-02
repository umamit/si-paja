'use client';

import { DrainageSegment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ConditionChartProps {
  segments: DrainageSegment[];
}

export function ConditionChart({ segments }: ConditionChartProps) {
  const existingSegs = segments.filter((s) => s.category !== 'proposed');
  const counts: Record<string, number> = {};
  existingSegs.forEach((seg) => {
    counts[seg.condition] = (counts[seg.condition] || 0) + 1;
  });

  const data = [
    { name: 'Baik', value: counts.baik || 0, color: '#10b981' },
    { name: 'Rusak Ringan', value: counts.rusak_ringan || 0, color: '#f59e0b' },
    { name: 'Rusak Sedang', value: counts.rusak_sedang || 0, color: '#f97316' },
    { name: 'Rusak Berat', value: counts.rusak_berat || 0, color: '#ef4444' },
    { name: 'Tersumbat', value: counts.tersumbat || 0, color: '#e11d48' },
    { name: 'Sedimentasi', value: counts.sedimentasi || 0, color: '#d97706' },
    { name: 'Sedang Perbaikan', value: counts.sedang_perbaikan || 0, color: '#3b82f6' },
    { name: 'Saluran Tanah', value: counts.saluran_tanah || 0, color: '#64748b' },
    { name: 'Tutup Rusak', value: counts.tutup_rusak || 0, color: '#8b5cf6' },
    { name: 'Lainnya', value: counts.lainnya || 0, color: '#6366f1' },
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
