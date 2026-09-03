'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download, Filter } from 'lucide-react';
import { DrainageSegment } from '@/types';

interface PrintFilterProps {
  roads: string[];
  selectedRoad: string;
  onSelectRoad: (road: string) => void;
  filteredSegments: DrainageSegment[];
}

export function PrintFilter({ roads, selectedRoad, onSelectRoad, filteredSegments }: PrintFilterProps) {
  const router = Router();

  const exportToCSV = () => {
    const headers = ['No', 'Nama Segmen', 'Panjang (m)', 'Lebar (cm)', 'Tinggi (cm)', 'Material', 'Kondisi'];
    const rows = filteredSegments.map((s, i) => [
      i + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      s.length_m,
      s.width_cm,
      s.depth_cm,
      s.material,
      s.condition,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = selectedRoad === 'ALL' ? 'Laporan_Drainase_Semua_Jalan.csv' : `Laporan_Drainase_${selectedRoad.replace(/\s+/g, '_')}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-300 shadow-sm">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">Ruang Jalan:</span>
          <select
            value={selectedRoad}
            onChange={(e) => onSelectRoad(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
          >
            <option value="ALL">Semua Ruang Jalan ({roads.length})</option>
            {roads.map((road) => (
              <option key={road} value={road}>
                {road}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-white text-slate-700">
          <Download className="h-4 w-4 text-emerald-600" /> Unduh CSV / Excel
        </Button>
        <Button onClick={() => window.print()} size="sm" className="gap-2 bg-[#003366] hover:bg-[#002244] text-white">
          <Printer className="h-4 w-4" /> Cetak / Simpan PDF
        </Button>
      </div>
    </div>
  );
}

function Router() {
  return useRouter();
}
